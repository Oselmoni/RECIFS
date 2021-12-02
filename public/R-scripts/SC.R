#### Load Distance Matrix
library(sp) # library for finding points in polygon
library(raster)

#save(input, file='input.rda')
#load('webApp/input.rda')

# function to compute coordinates of arrow lines
arrowCOORD = function(x,y,r, s=0.08) {
  
  ENDx=x+sin(deg2rad(r))*s
  ENDy=y+cos(deg2rad(r))*s
  
  STAx=x-sin(deg2rad(r))*s
  STAy=y-cos(deg2rad(r))*s
  
  ar1X = ENDx+sin(deg2rad(r+135))*(s/2)
  ar1Y = ENDy+cos(deg2rad(r+135))*(s/2)
  
  ar2X = ENDx+sin(deg2rad(r-135))*(s/2)
  ar2Y = ENDy+cos(deg2rad(r-135))*(s/2)
  
  return(list('ENDx'=ENDx,'ENDy'=ENDy,'STAx'=STAx,'STAy'=STAy,'ar1X'=ar1X,'ar1Y'=ar1Y,'ar2X'=ar2X,'ar2Y'=ar2Y))
}

# function to convert reg to rad and viceversa
deg2rad = function(deg) {
  return((pi * deg) / 180)
}

rad2deg = function(rad) {
  return((180 * rad) / pi)
}

# function to compute mean of a circle
meanCIRC  = function(x) {xr=deg2rad(x); return(rad2deg(atan2(sum(sin(xr)),sum(cos(xr)))))}


# load area of interest, create polygon
AOI=input[[1]]$SCreq$AOI

# add complementary AOI, in case AOI is across ±180° meridian
if (sum(AOI>(+180))>0) {
  AOI2=AOI
  AOI2[rep(c(T,F), times=length(AOI)/2)]=AOI[rep(c(T,F), times=length(AOI)/2)]-360
  PY1=Polygon(matrix(AOI, ncol=2, byrow=T), hole = F)
  PY2=Polygon(matrix(AOI2, ncol=2, byrow=T), hole = F)
  PYS=Polygons(list(PY1, PY2), 1)
} else if (sum(AOI<(-180))>0) {
  AOI2=AOI
  AOI2[rep(c(T,F), times=length(AOI)/2)]=AOI[rep(c(T,F), times=length(AOI)/2)]+360
  PY1=Polygon(matrix(AOI, ncol=2, byrow=T), hole=F)
  PY2=Polygon(matrix(AOI2, ncol=2, byrow=T), hole=F)
  PYS=Polygons(list(PY1, PY2), 1)
} else {
  PY1=Polygon(matrix(AOI, ncol=2, byrow=T), hole=F)
  PYS=Polygons(list(PY1), 1)
}

SPS=SpatialPolygons(list(PYS))

# check area, if exceeding thershold value --> compute only low resolution SC
AREA=getPolygonAreaSlot(PY1)
alert='"none"'
# set prefix of filename 
scrootLR = 'lr'
if (AREA>200) {
  scrootHR = 'lr'
  alert='"Area of interest is very large, only low resolution sea currents will be computed. If you want to display sea current at higher resolution, select a smaller area."'
} else {
  scrootHR = ''
}

# find index of months
scsuffix = paste0(input[[1]]$SCreq$months,'.tif')


# load SC direction and velocity rasters, using prefix and suffix to select months and resolution
#test='webApp/'
test=''
# high resolution
SCD=stack(paste0(test, 'public/DB/seacurrents/scD',scrootHR,scsuffix))
SCV=stack(paste0(test, 'public/DB/seacurrents/scV',scrootHR,scsuffix))

# low resolution
SCDlr=stack(paste0(test, 'public/DB/seacurrents/scD',scrootLR,scsuffix))
SCVlr=stack(paste0(test, 'public/DB/seacurrents/scV',scrootLR,scsuffix))


#### Create JSON object for sea currents at LOW resolution
### check if AOI is outside sea current records 

if (is.null(intersect(extent(SPS), extent(SCD)))) {   jsonout='{ "Error": "Area of interest is outside sea current records. Select an area of interest close to coral reefs." }'
} else {

# crop rasters to AOI
SCDlr=mask(SCDlr, SPS, updateNA=F)
SCDlr=crop(SCDlr,extent(SPS))
SCVlr=mask(SCVlr, SPS, updateNA=F)
SCVlr=crop(SCVlr,extent(SPS))

# transform to point values
dir = SCDlr[]
vel = SCVlr[]
XS=rep(seq(extent(SCDlr)[1], extent(SCDlr)[2], length.out = ncol(SCDlr)), times=nrow(SCDlr))
YS=rep(seq(extent(SCDlr)[4], extent(SCDlr)[3], length.out = nrow(SCDlr)), each=ncol(SCDlr))

XS=XS[is.na(dir)==F]
YS=YS[is.na(dir)==F]
vel=vel[is.na(dir)==F]
dir=dir[is.na(dir)==F]



#### Create JSON object for sea currents at high resolution

colorS = colorRampPalette(c('lightblue', 'purple'))(10)[cut(vel, breaks=10)]

jsonlist = c()

for (i in 1:length(XS)) {
  
  x=XS[i]
  y=YS[i]
  r=dir[i]
  
  AC=arrowCOORD(x,y,r, s = 0.2)
  
  id = sprintf('%05d', i)
  cols=colorS[i]
  
  jsonlist=c(jsonlist, 
             paste0('{ "col" : "',cols,'" , "COORD" : [[',round(AC$STAx,5),',',round(AC$STAy,5),'],[',round(AC$ENDx,5),',',round(AC$ENDy,5),']]  }'),
             paste0('{ "col" : "',cols,'" , "COORD" : [[',round(AC$ar1X,5),',',round(AC$ar1Y,5),'],[',round(AC$ENDx,5),',',round(AC$ENDy,5),']]  }'),
             paste0('{ "col" : "',cols,'" , "COORD" : [[',round(AC$ar2X,5),',',round(AC$ar2Y,5),'],[',round(AC$ENDx,5),',',round(AC$ENDy,5),']]  }')
  )
  
}

jsonoutLR = paste0('"LOWRES" : [' ,paste(jsonlist, collapse=','), ']')

# if low resolution mode --> high res = low res
if (scrootHR=='lr') {jsonoutHR  = paste0('"HIGHRES" : [' ,paste(jsonlist, collapse=','), ']') 
} else { # else: compute highres


#### Create JSON object for sea currents at high resolution

# crop rasters to AOI
SCD=mask(SCD, SPS, updateNA=F)
SCD=crop(SCD,extent(SPS))
SCV=mask(SCV, SPS, updateNA=F)
SCV=crop(SCV,extent(SPS))

# transform to point values
dir = SCD[]
vel = SCV[]
XS=rep(seq(extent(SCD)[1], extent(SCD)[2], length.out = ncol(SCD)), times=nrow(SCD))
YS=rep(seq(extent(SCD)[4], extent(SCD)[3], length.out = nrow(SCD)), each=ncol(SCD))

XS=XS[is.na(dir)==F]
YS=YS[is.na(dir)==F]
vel=vel[is.na(dir)==F]
dir=dir[is.na(dir)==F]

colorS = colorRampPalette(c('lightblue', 'purple'))(10)[cut(vel, breaks=10)]

jsonlist = c()

for (i in 1:length(XS)) {
  
  x=XS[i]
  y=YS[i]
  r=dir[i]
  
  AC=arrowCOORD(x,y,r, s = 0.03)
  
  id = sprintf('%05d', i)
  cols=colorS[i]
  
  jsonlist=c(jsonlist, 
             paste0('{ "col" : "',cols,'" , "COORD" : [[',round(AC$STAx,5),',',round(AC$STAy,5),'],[',round(AC$ENDx,5),',',round(AC$ENDy,5),']]  }'),
             paste0('{ "col" : "',cols,'" , "COORD" : [[',round(AC$ar1X,5),',',round(AC$ar1Y,5),'],[',round(AC$ENDx,5),',',round(AC$ENDy,5),']]  }'),
             paste0('{ "col" : "',cols,'" , "COORD" : [[',round(AC$ar2X,5),',',round(AC$ar2Y,5),'],[',round(AC$ENDx,5),',',round(AC$ENDy,5),']]  }')
  )
  
}

jsonoutHR = paste0('"HIGHRES" : [' ,paste(jsonlist, collapse=','), ']')

}

# set colorscale values for legend
colscL = colorRampPalette(c('lightblue', 'purple'))(10)
colscLb = round(seq(min(vel), max(vel), length.out = 10), 2)

# # set legend title
MOI=input[[1]]$SCreq$months # months of interest
moiL = c('01'='January', '02'='February', '03'='March',
         '04'='April', '05'='May', '06'='June',
         '07'='July', '08'='August', '09'='September',
         '10'='October', '11'='November', '12'='December',
         '13'='All year')
 
ltitle = paste0('Mean sea current velocity [m/s] - ', moiL[MOI])

# output json objects
jsonout = paste0('{ "Error": "none", "Alert" : ', alert, 
                 ', "Ltitle" : "',ltitle,'" ',
                 ', "colorscale" : ["', paste(colscL, collapse = '","'),'"] ',
                 ', "colorscaleBRK" : [', paste(colscLb, collapse = ','),'] ',
                 ', "Routput" : {', jsonoutLR, ' , ',jsonoutHR, '}}')
                                
}

return(jsonout)

#write.table(jsonout, 'webApp/public/test2.json', row.names=F, col.names=F, quote=F)
