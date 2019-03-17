# Ingecon Sun Monitor
Docker container to gather informations from Ingecon Sun photovoltaic Inverter, allowing to retrive them via an HTTP API or push them to a Graphite aggregator.

**Disclaimer:** This project is not affiliated with Ingeteam or Ingecom. It is a independent, unofficial API. Since it's not officially supported it may cause irreversibles damages to your equipment. Use it at your own risk.

![Grafana Screenshot](grafana.png?raw=true "Title")

**This code was tested on a INGECON SUN Lite TL with RS485 address 1**; 

### How is it working?
You'll need a RS485-to-TCP converter in order to connect to the inverter; I've used: [USR-TCP232-304](https://www.usriot.com/products/rs485-to-ethernet-converter.html)

Then you'll just need to clone the project; fill the envs in the _docker-compose.yml_ and run it using:

	docker-compose up -d


The data is reachable via HTTP at _http://localhost:3000_ or you can optionally configure it to push the data to a Graphite server.

#### Example of HTTP Output
	{"fv.gridVoltage":244,"fv.outputPower":3165,"fv.gridCurrent":12.94,"fv.busVoltage":370,"fv.photovoltaicModuleCurrent":8.53,"fv.photovoltaicModuleVoltage":372,"fv.efficiency": 0.99,"fv.time":1552834163}
