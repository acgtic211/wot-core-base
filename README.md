# WoT - Core
WoT - Core is an approach to develop lightweight WoT servients by reducing the implementation related to communication protocols. The server part that handles the communication with other devices is extracted and, instead of having a server for each servient, intermediary brokers are deployed to enable the communication between servients and devices. For each communication protocol, an intermediary broker is deployed, and a client for the intermediary broker is instantiated in the servient. Despite extracting the server part of the servient, it acts as a server for external entities that communicate with the devices.

## How to Add a Thing

To add a new Thing to the system, we need a series of files that will be added to the **Repository** module:

1. **Thing Description.** This file should be added to the *thing-descriptions* folder located in *repository > web-of-things*.
2. **Configuration Files.** These files can store an initial state for the Thing as well as various parameters required for its operation. These files should be placed in the *thing-configurations* and *thing-default-configurations* folders inside *repository > web-of-things*.
3. **Implementation File.** This file handles the implementation of the *handlers* for the properties and actions of the Thing. It should be located in the *thing-implementations* folder within *repository > web-of-things*.
4. **Web Component.** This file implements the web component that will render the Thing's interface. It should be placed in the *repository > web-components* folder.

Once these files have been implemented, we must add the Thing's information to the description of the servient that will expose or consume it. This description is located in *repository > web-of-things > servient-descriptions*.

Finally, if this new Thing subscribes to an event from another Thing, we must indicate this interaction in the application description so that the *Connector* Thing can link them. This file is located in *repository > web-of-things > app-descriptions*.

## How to Start the Application

To start **WoT - Core**, navigate to the *WoT* folder in the console and execute the following commands:

1. `docker compose build`
2. `docker compose up`