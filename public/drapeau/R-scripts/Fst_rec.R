### Script to provide reccomanded Fst threshold for Inbound Connectivity, Outbound Connectivity and Adaptive Potential
### LOAD REEF
reef = read.csv('public/drapeau/NewCaledonia/NewCal.csv')
rownames(reef) = reef$id

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

### evaluate Fst threshold

load('public/drapeau/NewCaledonia/SDfromB.Robj')
load('public/drapeau/NewCaledonia/SDtoB.Robj')

INrec = c()
OUTrec=c()

for (i in 1:nrow(input[[1]])) { # iterate every coral model in digital reef object
  
  conmod = input[[1]]$conmod[i]

  gendis.fromB = fitmodel(xm=conmod[[1]][,1], ym=conmod[[1]][,2], x=SDfromB)
  gendis.toB = fitmodel(xm=conmod[[1]][,1], ym=conmod[[1]][,2], x=SDtoB)
  
  gendis.fromB = gendis.fromB[,rownames(reef)]
  min.fromB = apply(gendis.fromB[,reef$SA==1],2,min,na.rm=T)
  
  gendis.toB = gendis.toB[rownames(reef),]
  min.toB = apply(gendis.toB[reef$SA==1,],1,min,na.rm=T)
  
  INrec=c(INrec, min(min.toB))
  OUTrec=c(OUTrec, min(min.fromB))
  
}


jsonout = paste0('{ "IN" : [', paste(round(INrec,5), collapse = ','), '] , "OUT" : [', paste(round(OUTrec,5), collapse = ',') , '] }' )

return(jsonout)
