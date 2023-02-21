#### Load Distance Matrix

load('public/drapeau/NewCaledonia/SD.Robj')

### LOAD REEF

reef = read.csv('public/drapeau/NewCaledonia/NewCal.csv')
rownames(reef) = reef$id
reef=reef[reef$SA==1,]


### Load aerial distance 

load('public/drapeau/NewCaledonia/adis.Robj')
adis=adis[rownames(reef),rownames(reef)]

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


totAPI=c() # total average API
### Iterate for every coral 

for (i in 1:nrow(input[[1]]$digitalreef)) {

  adamod = input[[1]]$digitalreef$adamod[i]
  
  if (is.null(adamod[[1]][[2]])==F) { # adaptive model is missing -> don't compute API
    
  ## Create an adaptive model out of user input
  
  Pa = fitmodel(xm=adamod[[1]][[1]][,1], ym=adamod[[1]][[1]][,2], x=as.matrix(reef[,adamod[[1]][[2]]]))

  ## compute API
  
  API=as.vector(Pa)
  names(API)=rownames(reef)
  # correct API using neighoring reefs 
  
  AdisT = 0.1 # 10 km buffer
  API2 =API
  for (i in 1:nrow(reef)) {
    idx = names(adis[i,adis[i,]<AdisT])
    API2[i] = mean(API[idx], na.rm=T)
  }
  API2[is.na(API2)] = API[is.na(API2)] # keep original value for reef with no newighbors
  
  totAPI = cbind(totAPI, API2)
  
  }
}

## Average API
av.API = apply(totAPI, 1, mean)

### Set breaks according to user input
if (input[[1]]$Ccolor[1]=='FALSE') {
  brk = seq(0,1,0.1) # if no min-max legend was specified: breaks in 10 parts
} else { # else: breaks in 8 parts, plus two at the extremities
  if ((as.numeric(input[[1]]$Ccolor[2])>=min(av.API))&(as.numeric(input[[1]]$Ccolor[3])<=max(av.API))) {brk = c(-0.5, seq(as.numeric(input[[1]]$Ccolor[2]), as.numeric(input[[1]]$Ccolor[3]), length.out = 9), Inf) 
  } else if ((as.numeric(input[[1]]$Ccolor[2])<min(av.API))&(as.numeric(input[[1]]$Ccolor[3])<=max(av.API))) {brk = c(seq(as.numeric(input[[1]]$Ccolor[2]), as.numeric(input[[1]]$Ccolor[3]), length.out = 10), Inf) 
  } else if ((as.numeric(input[[1]]$Ccolor[2])>=min(av.API))&(as.numeric(input[[1]]$Ccolor[3])>max(av.API))) {brk = c(-0.5, seq(as.numeric(input[[1]]$Ccolor[2]), as.numeric(input[[1]]$Ccolor[3]), length.out = 10)) 
  } else if ((as.numeric(input[[1]]$Ccolor[2])<min(av.API))&(as.numeric(input[[1]]$Ccolor[3])>max(av.API))) {brk = c(seq(as.numeric(input[[1]]$Ccolor[2]), as.numeric(input[[1]]$Ccolor[3]), length.out = 11)) 
  }
}


### Create a Color Scale
br = 10
cuts = cut(av.API, breaks=brk)
colfunc <- colorRampPalette(c('red2','yellow','green3')) 
col.API <- colfunc(br)[as.numeric(cuts)]

breakpos = matrix(unlist(strsplit(levels(cuts), ',')),ncol=2, byrow=T)[,1]
breakpos = round(c(as.numeric(substr(breakpos, 2, nchar(breakpos))), max(av.API,brk[is.finite(brk)])), 2)
breakpos[1] = 0
colscaleLegend = paste0(colfunc(br))


## Return as geoJSON object

lines = paste0('{ "type": "Feature", "properties": { "id": "',rownames(reef)[reef$SA==1],'", "API" : ', av.API,' , "col" : "',col.API,'", "area" : ', reef$AREA[reef$SA==1],' }, "geometry": { "type": "Point", "coordinates": [ ',reef$LON[reef$SA==1], ',', reef$LAT[reef$SA==1],' ] } } ')
jsonout =paste0('{
                "type": "FeatureCollection",
                "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::4326" , "colscale": [["',paste(colscaleLegend, collapse='","') ,'"] , [', paste(breakpos, collapse=',') ,' ] ] } },
                "features":[ ' ,paste(lines, collapse=','), '] }')
return(jsonout)

