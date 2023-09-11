const express = require("express");
const cors = require('cors')
const multer = require('multer')
const fs = require('fs')
const app = express();
const bodyParser = require("body-parser");

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/');
    },
    filename: (req, file, callback) => {
        let filename = 'map.tmx'
        callback(null, filename);
    }
});

let uploadFile = multer({ storage: storage })

app.get('/', function (req, res) {
    res.send("Welcome to Enum Generator API");
});

app.post('/enum/generate', (req, res) => {
    console.log(req.body);

    let jsCode = "";
    let enumName = req.body.enum_name;
    let enumKeys = req.body.enum_keys;

    jsCode += "/**\n";
    jsCode += " * This file is automatically generated and should not be edited.\n"
    jsCode += " */\n\n";

    jsCode += `const ${enumName} = {}\n`;

    let idx = 0;
    for (let key of enumKeys) {
        jsCode += `${enumName}.${key} = ${idx++}\n`;
    }

    jsCode += "\n/**\n";
    jsCode += " * @private\n";
    jsCode += " */\n";
    jsCode += `${enumName}._values = [\n`;
    for (let key of enumKeys) {
        jsCode += `    ${enumName}.${key},\n`;
    }
    jsCode += "]\n\n";
    jsCode += `${enumName}.values = () => ${enumName}._values;\n\n`

    jsCode += `${enumName}._names = {};\n`;
    for (let key of enumKeys) {
        jsCode += `${enumName}._names[${enumName}.${key}] = "${key}";\n`;
    }

    jsCode += "\n";
    jsCode += `${enumName}.nameOf = (value) => ${enumName}._names[value];\n`

    console.log(`Generated enum: \n${jsCode}`);
    res.send(jsCode);
});

app.post('/factory/generate', (req, res) => {
    console.log(req.body);

    let factoryName = req.body.factory_name;
    let typeEnum = req.body.type_enum;
    let mapping = req.body.mapping;

    let code = `const ${factoryName} = {};\n\n`;
    code += `${factoryName}.getModelFromType = type => {\n`;
    code += `    switch (type) {\n`;

    for (let key of Object.keys(mapping)) {
        code += `        case ${typeEnum}.${key}: \n`
        code += `            return new ${mapping[key][0]}();\n`;
    }

    code += `        default: \n`
    code += `            return null;\n`;
    code += "    }\n";
    code += "}\n\n";

    code += `${factoryName}.getViewFromModel = model => {\n`;
    code += "    let ret = null;\n";
    code += `    switch (model.getType()) {\n`;

    for (let key of Object.keys(mapping)) {
        code += `        case ${typeEnum}.${key}: \n`
        code += `            ret = GameObjectPool.instance.get(${mapping[key][1]});\n`;
        code += `            break;\n`;
    }

    code += "    }\n\n";
    code += `    if (ret == null) throw new Error("View not found for type: " + model.getType() + "!");\n`
    code += "    ret.bindWithModel(model);\n"
    code += "    return ret;\n"
    code += "}\n";

    console.log(code);
    res.send(code);
})

app.post('/adapter/enum/key/generate', (req, res) => {
    console.log(req.body);

    let enumA = req.body.enum_a;
    let enumB = req.body.enum_b;
    let className = "";

    if (req.body.name) 
        className = `${req.body.name}`;
    else 
        className = `${enumA}${enumB}Adapter`;

    let ab = `${enumA}To${enumB}`;
    let ba = `${enumB}To${enumA}`;

    let code = `const ${className} = {};\n`;
    code += `${className}.Adapter = {\n`;
    code += `   ${ab}: {},\n`;
    code += `   ${ba}: {},\n`;
    code += '};\n\n';

    code += `${className}.initAdapter = () => {\n`;

    code += `   let from${ab} = ${className}.Adapter.${ab};\n`;
    code += `   let from${ba} = ${className}.Adapter.${ba};\n`;
    code += '\n';

    code += `   let ${enumB}Types = Object.keys(${enumB});\n`;
    code += `   for (let type of Object.keys(${enumA})) {\n`;
    code += `       if (${enumB}Types.indexOf(type) < 0) continue;\n`;
    code += `       let temp = ${enumA}[type];\n`;
    code += `       from${ab}[temp] = ${enumB}[type];\n`;
    code += '   }\n\n';

    code += `   let ${enumA}Types = Object.keys(${enumA});\n`;
    code += `   for (let type of Object.keys(${enumB})) {\n`;
    code += `       if (${enumA}Types.indexOf(type) < 0) continue;\n`;
    code += `       let temp = ${enumB}[type];\n`;
    code += `       from${ba}[temp] = ${enumA}[type];\n`;
    code += '   }\n';

    code += '}();\n';

    res.send(code);
})

app.post('/adapter/enum/map/generate', (req, res) => {
    console.log(req.body);

    let enumA = req.body.enum_a;
    let enumB = req.body.enum_b;
    let className = "";

    if (req.body.name) 
        className = `${req.body.name}`;
    else 
        className = `${enumA}${enumB}Mapper`;

    let mapping = req.body.mapping;
    let code = `// This is automatically generated code\nconst ${className} = {};\n\n`
    let ab = `${enumA}To${enumB}`;
    let ba = `${enumB}To${enumA}`;

    let keys = Object.keys(mapping);
    let values = Object.keys(mapping).map(x => mapping[x]);

    code += `${className}.${ab} = {};\n`;
    for (let key of keys) {
        let value = mapping[key];
        code += `${className}.${ab}[${enumA}.${key}] = ${enumB}.${value};\n`;
    }
    code += '\n';

    code += `${className}.${ba} = {};\n`;
    for (let i = 0; i < values.length; ++i) {
        code += `${className}.${ba}[${enumB}.${values[i]}] = ${enumA}.${keys[i]};\n`;
    }
    code += '\n';

    res.send(code);
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port 3000")
});