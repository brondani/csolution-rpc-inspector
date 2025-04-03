# Examples of csolution rpc methods
## GetVersion
Request:
``` json
{"jsonrpc":"2.0","id":0,"method":"GetVersion"}
```
Response:
``` json
{"id":0,"jsonrpc":"2.0","result":"2.9.0-jsonrpc2"}
```

## LoadPacks
Request:
``` json
{"jsonrpc":"2.0","id":1,"method":"LoadPacks"}
```
Response:
``` json
{"id":1,"jsonrpc":"2.0","result":true}
```

## LoadSolution
Request:
``` json
{"jsonrpc":"2.0","id":2,"method":"LoadSolution","params":{"solution":"path/to/solution.csolution.yml"}}
```
Response:
``` json
{"id":2,"jsonrpc":"2.0","result":true}
```

## GetPacksInfo
Request:
``` json
{"jsonrpc":"2.0","id":3,"method":"GetPacksInfo","params":{"context":"project.build+target"}}
```
Response:
``` json
{"id":3,"jsonrpc":"2.0","result":{
  "packs":[{
    "description":"CMSIS (Common Microcontroller Software Interface Standard)","id":"ARM::CMSIS@6.1.0",
    "overview":"arm/packs/ARM/CMSIS/6.1.0/CMSIS/Documentation/Overview.md",
    "references":["solution.csolution.yml","project.cproject.yml","board.clayer.yml"],
    "used":true
  }]
}}
```

## GetComponentsInfo
Request:
``` json
{"jsonrpc":"2.0","id":4,"method":"GetComponentsInfo","params":{"context":"project.build+target"}}
```
Response:
``` json
{"id":4,"jsonrpc":"2.0","result":{
  "apis":[{
    "description":"CAN Driver API for Cortex-M",
    "doc":"arm/packs/ARM/CMSIS/6.1.0/CMSIS/Documentation/html/Driver/group__can__interface__gr.html",
    "id":"CMSIS Driver:CAN@1.3.0"
  }],
  "bundles":[{
    "description":"lwIP (Lightweight IP stack)",
    "doc":"C:/Users/danbro01/AppData/Local/arm/packs/lwIP/lwIP/2.2.0/lwip/doc/doxygen/output/index.html",
    "id":"lwIP::Network&lwIP@2.2.0"
  }],
  "components":[{
    "description":"An all-in-one generic benchmark for arm-2d.",
    "from-pack":"ARM::Arm-2D@1.1.5",
    "selected": true
  }],
  "taxonomy":[{
    "description":"A 2D Image Processing Library for Cortex-M Processors",
    "doc":"arm/packs/ARM/Arm-2D/1.1.5/documentation/index.html",
    "id":"Acceleration:Arm-2D"
  }]
}}
```
## ValidateComponents
Request:
``` json
{"jsonrpc":"2.0","id":5,"method":"ValidateComponents","params":{"context":"project.build+target","components":["ARM::CMSIS:CORE@6.1.0","ARM::CMSIS:RTOS2:Keil RTX5&Source@5.9.0"]}}
```
Response:
``` json
{"id":5,"jsonrpc":"2.0","result":{
  "validation":[{
    "conditions":[{
      "aggregates":["ARM::CMSIS:OS Tick:SysTick"],
      "expression":"require CMSIS:OS Tick"}],
      "id":"ARM::CMSIS:RTOS2:Keil RTX5&Source@5.9.0",
      "result":"SELECTABLE"
  }]
}}
```
## GetLogMessages
Request:
``` json
{"jsonrpc":"2.0","id":6,"method":"GetLogMessages"}
```
Response:
``` json
{"id":6,"jsonrpc":"2.0","result":{
  "errors":["missing device and/or board info"],
  "warnings":["windows-amd64 - manifest file does not exist"]
}}
```
