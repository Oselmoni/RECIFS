# Function to retrieve decimal position
decimalplaces  = function(x) {
  if (is.na(x)) {return(NA)
  } else {
    d=0
    nx=x
    if (nx==0) {return(2)}
    while(nx<1) {
      d=d+1
      nx=x*(10^d)
    }
    return(d)}
}

# function to round to decimal position
roundVar = function(X) {
  delta = diff(range(X[is.finite(X)], na.rm=T))/length(X) 
  if (is.finite(delta)) {
    DP=decimalplaces(diff(range(X[is.finite(X)], na.rm=T))/length(X)) 
  } else {DP=NA}
  round(X, DP)
}