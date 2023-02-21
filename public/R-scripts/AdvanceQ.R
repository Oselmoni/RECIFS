#### Load Distance Matrix
library(sp) # library for finding points in polygon
source('public/R-scripts/roundDecimal.R')
# load('input.rda')
# load('public/DB/allDB_coords.rda')
# source('public/R-scripts/roundDecimal.R')

#save(input, file='input.rda')

### Load coordinates
load('public/DB/allDB_coords.rda')

# find variable of interest
ENVVAR = input[[1]]$ADVreq$envvar

# find buffer of interest
BUFVAR = input[[1]]$ADVreq$buffer


# load all data for variable of interest
load(paste0('public/DB/DBadvanced/s_allDB_',ENVVAR,'_',BUFVAR,'.rda'))


### find reefs in AOI
AOI=input[[1]]$ADVreq$AOI # load AOI arriving from client
pox = AOI[rep(c(T,F), times=length(AOI)/2)] # get x coord poly
poy = AOI[rep(c(F,T), times=length(AOI)/2)] # get y coord poly

# correct longitudes exceeding ±180°
pox[pox>(+180)] = pox[pox>(+180)]-360
pox[pox<(-180)] = pox[pox<(-180)]+360

# check max distance between longitude of AOI
D_lon = diff(range(pox))

# maximal longitudinal distance allowed between points  : 180°
if (D_lon<180) {PiP = point.in.polygon(allDB_coords$lon, allDB_coords$lat, pox, poy, mode.checked=FALSE)
} else { # if 180° are exceeded, take complementary distance  
  nx0 =  min(pox[sign(pox)==1]) # set new origin of longitudinal axes (minimal longitude with postive sign)
  # correct AOI longitudes,  using new coordinates system
  npox = pox 
  npox[pox>=nx0] = npox[pox>=nx0]-nx0
  npox[pox<nx0] = npox[pox<nx0]+(360-nx0)
  # correct longitudes of reefs
  nlon_reefs=allDB_coords$lon
  nlon_reefs[allDB_coords$lon>=nx0] = nlon_reefs[allDB_coords$lon>=nx0]-nx0
  nlon_reefs[allDB_coords$lon<nx0] = nlon_reefs[allDB_coords$lon<nx0]+(360-nx0)
  # extract PiP
  PiP = point.in.polygon(nlon_reefs, allDB_coords$lat, npox, poy, mode.checked=FALSE)
}

# subset reefs to AOI

reefs_AOI = allDB_coords[PiP!=0,]

if (nrow(reefs_AOI)==0) {return('{"Error": "No reefs available for this area"}') 
  } else if (nrow(reefs_AOI)<5) {return('{"Error": "Reef area is too small, try to select a larger area"}')
  } else if (nrow(reefs_AOI)>=5) {

### different behaviour if variable is temporal or fixed:
if (input[[1]]$ADVreq$typeVAR=='F') { # if fixed...
  
  OUTVAR = s_allDB[rownames(reefs_AOI),]
  
  outvarid = paste0(ENVVAR,'_X_',BUFVAR) # 'X' indicates fixed variable 
  
} else  { # if temporal 
  
  if (input[[1]]$ADVreq$typeVAR=='Y') {  # if yearly resolution variable
    
    selectedY = substr(input[[1]]$ADVreq$time$years$ys, 2,5):substr(input[[1]]$ADVreq$time$year$ye, 2,5)
    availableY = matrix(unlist(strsplit(colnames(s_allDB), '_X')), ncol=2, byrow=T)[,2]
    
    OUTVARM = s_allDB[rownames(reefs_AOI),paste0(ENVVAR,'_X',selectedY[selectedY%in%availableY]),drop=F] # matrix for computation of temporal variable
    
  } else {  # if monthly resolution variable...
  
  # four alternatives: all years + all months, all years + some months, some years + all months, some y + some m
  
  if (input[[1]]$ADVreq$time$years$cb==TRUE&input[[1]]$ADVreq$time$months$cb==TRUE) { # all y and m
    OUTVARM = s_allDB[rownames(reefs_AOI),,drop=F] # matrix for computation of temporal variable


   } else if (input[[1]]$ADVreq$time$years$cb==TRUE&input[[1]]$ADVreq$time$months$cb!=TRUE) { # all y, some m
    
    # find months available in DB 
    timeindex = matrix(unlist(strsplit(colnames(s_allDB), '_')), ncol=2, byrow=T)[,2]
    monthsindex = substr(timeindex, 2,3)
    
    # find months requested by client
    selectedM = sprintf('%02d', which(input[[1]]$ADVreq$time$months$ms=='1'))
    OUTVARM = s_allDB[rownames(reefs_AOI),monthsindex%in%selectedM,drop=F]
    
    
  } else if (input[[1]]$ADVreq$time$years$cb!=TRUE&input[[1]]$ADVreq$time$months$cb==TRUE) { # some y, all m
    
    # find months available in DB 
    timeindex = matrix(unlist(strsplit(colnames(s_allDB), '_')), ncol=2, byrow=T)[,2]
    yearsindex = substr(timeindex, 5,8)
    
    # find years requested by client
    selectedY = substr(input[[1]]$ADVreq$time$years$ys, 2,5):substr(input[[1]]$ADVreq$time$year$ye, 2,5)
    OUTVARM = s_allDB[rownames(reefs_AOI),yearsindex%in%selectedY,drop=F]
  
    
    } else if (input[[1]]$ADVreq$time$years$cb!=TRUE&input[[1]]$ADVreq$time$months$cb!=TRUE) { # some y, some m
    
    # find years and  months available in DB 
    timeindex = matrix(unlist(strsplit(colnames(s_allDB), '_')), ncol=2, byrow=T)[,2]
    yearsindex = substr(timeindex, 5,8)
    monthsindex = substr(timeindex, 2,3)
    
    # find years and months  requested by client
    selectedY = substr(input[[1]]$ADVreq$time$years$ys, 2,5):substr(input[[1]]$ADVreq$time$year$ye, 2,5)
    selectedM = sprintf('%02d', which(input[[1]]$ADVreq$time$months$ms=='1'))
    
    OUTVARM = s_allDB[rownames(reefs_AOI),yearsindex%in%selectedY&monthsindex%in%selectedM,drop=F]
  }
  }
  # check if there are columns (if temporal extent is not exceeded)
  
  if (ncol(OUTVARM)==0) {
    timeindex = substr(matrix(unlist(strsplit(colnames(s_allDB), '_')), ncol=2, byrow=T)[,2],2,8)
    return(paste0('{"Error": "No data found for the selected temporal window. Note that this variable is currently available for all the months from ', timeindex[1],' to ', timeindex[length(timeindex)],'."}'))
  } else { # if there is data --> compute the statistic
    
    if (input[[1]]$ADVreq$fun=='Mean') {
      OUTVAR = apply(OUTVARM, 1, mean, na.rm=T)
      outvarid = paste0(ENVVAR,'_me_',BUFVAR,'_c')}
    if (input[[1]]$ADVreq$fun=='Standard deviation') {
      if (ncol(OUTVARM)<=1) {OUTVAR = rep(0, length=nrow(OUTVARM)); names(OUTVAR) = rownames(OUTVARM)} else {
      OUTVAR = apply(OUTVARM, 1, sd, na.rm=T)}
      outvarid = paste0(ENVVAR,'_sd_',BUFVAR,'_c')} 
    if (input[[1]]$ADVreq$fun=='Minimum') {OUTVAR = apply(OUTVARM, 1, min, na.rm=T)   
      outvarid = paste0(ENVVAR,'_mi_',BUFVAR,'_c')}
    if (input[[1]]$ADVreq$fun=='Maximum') {OUTVAR = apply(OUTVARM, 1, max, na.rm=T)
      outvarid = paste0(ENVVAR,'_ma_',BUFVAR,'_c')}
    if (input[[1]]$ADVreq$fun=='Median') {OUTVAR = apply(OUTVARM, 1, median, na.rm=T)
      outvarid = paste0(ENVVAR,'_md_',BUFVAR,'_c')}
  }
}

### round values of variables to reduce size of object to be transferred to client 
OUTVAR[is.finite(OUTVAR)==F] = NA
r_OUTVAR=roundVar(OUTVAR)

### create colorscale for every variable
nbrks = 10 # establish number of color breaks

# check if custom colors
if (input[[1]]$ADVreq$csCOL$cb==TRUE) { # set customized colorscale
  colors=c(input[[1]]$ADVreq$csCOL$low,input[[1]]$ADVreq$csCOL$mid,input[[1]]$ADVreq$csCOL$max)
  } else { colors = c('blue3','purple2','yellow2','orange2','red3')   } # set default colorscale


# create colorscale

if (sum(is.na(r_OUTVAR))==length(r_OUTVAR)) {COLSCA=rep(NA, length(var))  # if no data, no colorscale
} else {
  # compute color breaks
  minCS=min(r_OUTVAR, na.rm=T)
  maxCS=max(r_OUTVAR, na.rm=T)

  # check if custom colorscale limits
  if (input[[1]]$ADVreq$csLIM$cb==TRUE) { # set customized colorscale limits
    minCSc=as.numeric(input[[1]]$ADVreq$csLIM$min)
    maxCSc=as.numeric(input[[1]]$ADVreq$csLIM$max)
    BRK=c(min(minCS, minCSc)-0.01, seq(minCSc, maxCSc, length.out = nbrks-1), max(maxCSc, maxCS)+0.01)
  } else { # set default colorscale limits

    BRK=c(minCS-0.01, seq(quantile(r_OUTVAR, 0.01, na.rm=T), quantile(r_OUTVAR, 0.99, na.rm=T), length.out = nbrks-1), maxCS+0.01)
  } 
  # compute colorscale
  if (length(unique(BRK))<nbrks) {
    COLSCA=colorRampPalette(colors)(length(unique(BRK)))[cut(r_OUTVAR, breaks=unique(BRK))]
  } else {  COLSCA=colorRampPalette(colors)(nbrks)[cut(r_OUTVAR, breaks=BRK)]}
  }

# create colorscale break information for legend

# round colorscaleINFO
r_colorscalesINFO=roundVar(BRK)


##### Return as geoJSON object


# write reefs as features, with values for every variables and corresponding colors
allfeatures = c()
for (r in 1:nrow(reefs_AOI)) { # for every reef...
  
  # create json entry
  features = paste0('{ "type": "Feature", "properties": { "id": "',rownames(reefs_AOI)[r],'", "variables" : {')
  
  # add variables objects
  variables = r_OUTVAR[r]
  variables[is.na(variables)] = 'null' # value for missing values           
  JSONvariables = paste(paste0('"',outvarid,'" : ', variables), collapse=', ')
  
  features = paste0(features, JSONvariables, '}, "colorscale" : {')           
  
  # add colorscale objects
  colorsaoi = COLSCA[r]
  colorsaoi[is.na(colorsaoi)] = '#8c8c8c' # color for missing values              
  JSONcolorsaoi = paste(paste0('"',outvarid, '" : "', colorsaoi,'"'), collapse=', ')

  features = paste0(features, JSONcolorsaoi, '} }, ')           
  
  # add lon/lat
  
  features = paste0(features, ' "geometry": { "type": "Point", "coordinates": [ ', reefs_AOI[r,1], ',', reefs_AOI[r,2],' ] } } ')
  
  # add to allfeature list
  
  allfeatures=c(allfeatures, features)
}

# write colorscale info for legend in JSON
colbks = r_colorscalesINFO[round(seq(1, length(r_colorscalesINFO), length.out = nbrks))]
colbks[1]=paste0('<',colbks[2])
colbks[length(colbks)]=paste0('>',colbks[length(colbks)-1])
colbks=paste0('"',paste(colbks, collapse='","'),'"')


colbks=paste0('"',outvarid, '" : [', colbks,']')

colscale = colorRampPalette(colors)(nbrks)

## merge all json output

jsonout = paste0('{ "Error" : "none" , "ROutput" : {
                "type": "FeatureCollection",
                "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::4326"} } ,
                "meta" : { "colscale" : [ "',  paste(colscale, collapse='","'),'" ] ,', 
                          '"colscaleBRKS": { ',paste(colbks, collapse=','),' } },
                "features":[ ' ,paste(allfeatures, collapse=','), '] } }')

#write.table(jsonout, 'test.json', row.names=F, col.names=F, quote=F)

return(jsonout)
}
