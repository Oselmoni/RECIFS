# RECIFS

RECIFS is the acronym for Reef Environment Centralized InFormation System. RECIFS is a web-interface that provides access to environmental data describing the reef environment worldwide. The data displayed in RECIFS come from publicly databases and are available in complete open access. 

This repository includes scripts and codes to run RECIFS locally through Docker. 

## Run RECIFS locally via Docker :

1. Generate a SSL self-signed key with

   ```bash
   make generate-selfsigned-ssl
   ```

2. Run it with

   ```bash
   make run-local
   ```

check : https://localhost/ (accept self-signed certificate)


## Repository structure

The RECIFS web-app is a NodeJS server, written in a combination of HTML, Javascript and R. The interactive map is rendered through the Openlayers library.  

The repository is structured in the following folders: 

#### Controllers

Includes the controller.js script to handle client-server interactions. 

#### Views

Includes the .ejs files defining the html structure of the single-page application

#### Public

Includes multiple folders determining the functionalities of the web-application, in particular: 

> backgroundLayers: includes the .geojson vector layers for the background maps. 
>buttons: includes the .svg icons of the application buttons.
>DB: the database data (environmental conditions, reef coordinates) in the .rda (R-object data). Also includes sea current raw data, in raster format (.tif)
>logos: logos in .svg format
>R-scripts: R-script to handle the client qeuries, process the data (from the DB repository), and return an output. 
>scripts: javascripts defining the interaction of the client with the web-inferface. 
>src: javascript libraries used by the scripts in the "scripts" folder. 
>styles: includes the RECIFS.css file, controlling the style (colors and fonts) on the web-page. 



## Terms of use:

RECIFS and the data provided are in the public domain. RECIFS is available in complete open access and free of charge. Nevertheless, we ask that any derivative work (e.g. scientific publications, maps, reports, software) using the data from RECIFS attributes the credit to: (1) the original data source (refer to the button in the environmental data window) and (2) RECIFS for processing and serving the data. The authors are not responsible for any problems relating to the accuracy of the data served through RECIFS. 
