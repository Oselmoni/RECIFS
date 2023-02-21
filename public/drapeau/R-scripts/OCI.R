#### Load Distance Matrix
load('public/drapeau/NewCaledonia/SD.Robj')

### Load aerial distance 

load('public/drapeau/NewCaledonia/adis.Robj')
adis=adis[rownames(SD),colnames(SD)]

### LOAD REEF

reef = read.csv('public/drapeau/NewCaledonia/NewCal.csv')
rownames(reef) = reef$id

reef=reef[rownames(SD),]

## Function to fit models

fitmodel = function(xm, ym, x) {
  
  # create response variable y
  y = matrix(NA, ncol=ncol(x), nrow=nrow(x))
  rownames(y) = rownames(x)
  colnames(y) = colnames(x)
  for (i in 2:length(xm)) { # browse across different knots of splines
    
    mod = lm(c(ym[i-1], ym[i])~c(xm[i-1], xm[i])) # create models between knots
    
    if (i==2) {
      ind=which(x<xm[i])
    } else if (i==length(xm)) {
      ind=which(x>=xm[i-1])
    } else {
      ind=which(x>=xm[i-1]&x<xm[i])
    }
    
    
    y[ind] = (x[ind]*mod$coefficients[2])+mod$coefficients[1] # fit x
    
  }
  y[y>1]=1
  y[y<0]=0
  return(y)
}


### Set Fst threshold
FstT = as.numeric(input[[1]]$FstT)

totOCI=c() # total average API
### Iterate for every coral 

for (i in 1:nrow(input[[1]]$digitalreef)) {
  
  conmod = input[[1]]$digitalreef$conmod[i]
  
  ## Create a connectivity model out of client input
  
  gendis = fitmodel(xm=conmod[[1]][,1], ym=conmod[[1]][,2], x=SD)
  
  ## compute API
  
  OCI=apply(gendis[,reef$SA==1],1, function(x) { ### !!! set dispersal towards reef of study area only!!
    if (sum(is.na(x))/length(x)<0.5) { # check if too many NAs
      return(sum(reef$AREA[x<FstT], na.rm=T))
    } else {return(NA)}  } )
  
  # correct API using neighoring reefs 
  
  AdisT = 0.1 # 10 km buffer
  OCI2 =OCI
  for (i in 1:nrow(reef)) {
    idx = names(adis[i,adis[i,]<AdisT])
    OCI2[i] = mean(OCI[idx], na.rm=T)
  }
  OCI2[is.na(OCI2)] = OCI[is.na(OCI2)] # keep original value for reef with no newighbors
  
  totOCI = cbind(totOCI, OCI2)
  
}

## Average API
av.OCI = apply(totOCI, 1, mean)
## Keep only reef in Study Area
av.OCI = av.OCI[reef$SA==1] 


### Set breaks according to user input
if (input[[1]]$Ccolor[1]=='FALSE') {
  brk = 10 # if no min-max legend was specified: breaks in 10 parts
} else { # else: breaks in 8 parts, plus two at the extremities
  if ((as.numeric(input[[1]]$Ccolor[2])>=min(av.OCI))&(as.numeric(input[[1]]$Ccolor[3])<=max(av.OCI))) {brk = c(-0.5, seq(as.numeric(input[[1]]$Ccolor[2]), as.numeric(input[[1]]$Ccolor[3]), length.out = 9), Inf) 
  } else if ((as.numeric(input[[1]]$Ccolor[2])<min(av.OCI))&(as.numeric(input[[1]]$Ccolor[3])<=max(av.OCI))) {brk = c(seq(as.numeric(input[[1]]$Ccolor[2]), as.numeric(input[[1]]$Ccolor[3]), length.out = 10), Inf) 
  } else if ((as.numeric(input[[1]]$Ccolor[2])>=min(av.OCI))&(as.numeric(input[[1]]$Ccolor[3])>max(av.OCI))) {brk = c(-0.5, seq(as.numeric(input[[1]]$Ccolor[2]), as.numeric(input[[1]]$Ccolor[3]), length.out = 10)) 
  } else if ((as.numeric(input[[1]]$Ccolor[2])<min(av.OCI))&(as.numeric(input[[1]]$Ccolor[3])>max(av.OCI))) {brk = c(seq(as.numeric(input[[1]]$Ccolor[2]), as.numeric(input[[1]]$Ccolor[3]), length.out = 11)) 
  }
}


### Create a Color Scale
br = 10
cuts = cut(av.OCI, breaks=brk)
colfunc <- colorRampPalette(c('red2','yellow','green3')) 
col.OCI <- colfunc(br)[as.numeric(cuts)]



breakpos = matrix(unlist(strsplit(levels(cuts), ',')),ncol=2, byrow=T)[,1]
breakpos = ceiling(c(as.numeric(substr(breakpos, 2, nchar(breakpos))), max(av.OCI,brk[is.finite(brk)])))
colscaleLegend = paste0(colfunc(br))


## Return as geoJSON object

lines = paste0('{ "type": "Feature", "properties": { "id": "',rownames(reef)[reef$SA==1],'", "OCI" : ', av.OCI,' , "col" : "',col.OCI,'" , "area" : ', reef$AREA[reef$SA==1],' }, "geometry": { "type": "Point", "coordinates": [ ',reef$LON[reef$SA==1], ',', reef$LAT[reef$SA==1],' ] } } ')
jsonout =paste0('{
                "type": "FeatureCollection",
                "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::4326" , "colscale": [["',paste(colscaleLegend, collapse='","') ,'"] , [', paste(breakpos, collapse=',') ,' ] ] } },
                "features":[ ' ,paste(lines, collapse=','), '] }')

return(jsonout)

