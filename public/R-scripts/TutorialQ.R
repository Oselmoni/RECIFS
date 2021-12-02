#### Load Distance Matrix
library(sp) # library for finding points in polygon
source('public/R-scripts/roundDecimal.R')
# load('webApp/input.rda')
# load('webApp/public/DB/allDB_summary.rda')
# load('webApp/public/DB/allDB_coords.rda')
# source('webApp/public/R-scripts/roundDecimal.R')

#save(input, file='input.rda')

### Load summary variables from database
load('public/DB/allDB_summary.rda')

### Load coordinates
load('public/DB/allDB_coords.rda')

### find reefs in AOI

AOI=input[[1]]$AOIcoord # load AOI arriving from client
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
  nx0 =  min(pox[sign(pox)==1]) # set new origin of longitudinal axes (minimal longitude with positive sign)
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



### find reefs in RED SEA

RS_AOI=input[[1]]$RScoord # load AOI arriving from client
pox = RS_AOI[rep(c(T,F), times=length(RS_AOI)/2)] # get x coord poly
poy = RS_AOI[rep(c(F,T), times=length(RS_AOI)/2)] # get y coord poly

# correct longitudes exceeding ±180°
pox[pox>(+180)] = pox[pox>(+180)]-360
pox[pox<(-180)] = pox[pox<(-180)]+360

# check max distance between longitude of AOI
D_lon = diff(range(pox))

# maximal longitudinal distance allowed between points  : 180°
if (D_lon<180) {PiP = point.in.polygon(allDB_coords$lon, allDB_coords$lat, pox, poy, mode.checked=FALSE)
} else { # if 180° are exceeded, take complementary distance  
  nx0 =  min(pox[sign(pox)==1]) # set new origin of longitudinal axes (minimal longitude with positive sign)
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

reefs_RS = allDB_coords[PiP!=0,]

RSinAOI = mean(rownames(reefs_RS)%in%rownames(reefs_AOI))
AOIinRS = mean(rownames(reefs_AOI)%in%rownames(reefs_RS))

if (RSinAOI<0.8|AOIinRS<0.95) {return('{"Error" : "Select an area of interest matching with the entire Red Sea extent (the green area)"}')} else {

if (nrow(reefs_AOI)==0) {return('{"Error": "No reefs available for this area"}') 
  } else if (nrow(reefs_AOI)<5) {return('{"Error": "Reef area is too small, try to select a larger area"}')
  } else if (nrow(reefs_AOI)>=5) {

### find summary variables for reefs in AOI
summary_AOI = as.data.frame(allDB_summary[rownames(reefs_AOI),])

### round values of variables to reduce size of object to be transferred to client 
r_summary_AOI=apply(summary_AOI, 2, roundVar)

### create colorscale for every variable
nbrks = 10 # establish number of color breaks
colors = c('green3','gold2','red1')  # establish colorscale

# create reef table with colors

summary_AOI_cs = data.frame(apply(r_summary_AOI, 2, function(var) {
  if (sum(is.na(var))==length(var)) {COLSCA=rep(NA, length(var))  
  } else {
  # compute color breaks
  BRK=c(min(var, na.rm=T)-0.01, seq(quantile(var, 0.01, na.rm=T), quantile(var, 0.99, na.rm=T), length.out = nbrks-1), max(var, na.rm=T)+0.01)
  # compute colorscale
  if (length(unique(BRK))<nbrks) {
    COLSCA=colorRampPalette(colors)(length(unique(BRK)))[cut(var, breaks=unique(BRK))]
  } else {  COLSCA=colorRampPalette(colors)(nbrks)[cut(var, breaks=BRK)]}
  }
  return(COLSCA)
}), stringsAsFactors = F)

# create colorscale break information for legend

colorscalesINFO = data.frame(apply(r_summary_AOI, 2, function(var) {
  if (sum(is.na(var))==length(var)) {BRK=rep(NA, length(nbrks))  
  } else {  # compute color breaks
  BRK=c(min(var, na.rm=T)-0.01, seq(quantile(var, 0.01, na.rm=T), quantile(var, 0.99, na.rm=T), length.out = nbrks-1), max(var, na.rm=T)+0.01)
  }
  return(BRK)
  
}), stringsAsFactors = F)

# round colorscaleINFO
r_colorscalesINFO=apply(colorscalesINFO, 2, roundVar)


##### Return as geoJSON object


# write reefs as features, with values for every variables and corresponding colors
allfeatures = c()
for (r in 1:nrow(reefs_AOI)) { # for every reef...
  
  # create json entry
  features = paste0('{ "type": "Feature", "properties": { "id": "',rownames(reefs_AOI)[r],'", "variables" : {')
  
  # add variables objects
  variables = r_summary_AOI[r,,drop=F]
  variables[is.na(variables)] = 'null' # value for missing values           
  JSONvariables = paste(paste0('"',colnames(variables), '" : ', variables), collapse=', ')
  
  features = paste0(features, JSONvariables, '}, "colorscale" : {')           
  
  # add colorscale objects
  colorsaoi = as.matrix(summary_AOI_cs[r,,drop=F])
  colorsaoi[is.na(colorsaoi)] = '#8c8c8c' # color for missing values              
  JSONcolorsaoi = paste(paste0('"',colnames(colorsaoi), '" : "', colorsaoi,'"'), collapse=', ')

  features = paste0(features, JSONcolorsaoi, '} }, ')           
  
  # add lon/lat
  
  features = paste0(features, ' "geometry": { "type": "Point", "coordinates": [ ', reefs_AOI[r,1], ',', reefs_AOI[r,2],' ] } } ')
  
  # add to allfeature list
  
  allfeatures=c(allfeatures, features)
}

# write colorscale info for legend in JSON
colbks = apply(r_colorscalesINFO[round(seq(1, nrow(r_colorscalesINFO), length.out = nbrks)),], 2, function(x) {
  x[1]=paste0('<',x[2])
  x[length(x)]=paste0('>',x[length(x)-1])
  paste0('"',paste(x, collapse='","'),'"')
})
colbks[colbks==paste(rep(NA, nbrks), collapse=',')] = '"null"'
colbks=paste0('"',names(colbks), '" : [', colbks,']')

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
}}
