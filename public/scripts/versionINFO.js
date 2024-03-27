// script to add version info to support tab
// note: the [1] makes sure that only the latest version is reported. 
document.getElementById('versionINFO').innerHTML = 'Database version: '+ versionINFO.DB[0].version + ' (released '+versionINFO.DB[0].releaseDate+')'+
                                                    '<br>'+
                                                    'Web-app version: '+ versionINFO.webapp[0].version + ' (released '+versionINFO.webapp[0].releaseDate+')'+
                                                    '<br>'+
                                                    'Tutorial version: '+ versionINFO.tutorial[0].version + ' (released '+versionINFO.tutorial[0].releaseDate+')'
