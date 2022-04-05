// script to add version info to support tab

document.getElementById('versionINFO').innerHTML = 'Database version: '+ versionINFO.DB.version + ' (released '+versionINFO.DB.releaseDate+')'+
                                                    '<br>'+
                                                    'Webapp version: '+ versionINFO.webapp.version + ' (released '+versionINFO.webapp.releaseDate+')'
