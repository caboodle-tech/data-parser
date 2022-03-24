class DataParser {

    #processElementAttributes(attributes){
        const obj = {
            _length: attributes.length
        };
        for (let i = 0; i < attributes.length; i++) {
            const node = attributes[i];
            obj[node.nodeName] = node.nodeValue;
        }
        return obj;
    };

    #processXml(parent) {
        const attr = {};
        const attrData = {};
        const json = {};
        const jsonData = {};
        attr[parent.nodeName.toLowerCase()] = attrData;
        json[parent.nodeName.toLowerCase()] = jsonData;
        attrData._attributes = this.#processElementAttributes(parent.attributes);
        for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            attrData[child.nodeName.toLowerCase()] = {
                _attributes: this.#processElementAttributes(child.attributes)
            };
            if (child.children.length > 0) {
                const [childJson, childAttr] = this.#processXml(child);
                Object.keys(childAttr).forEach((key) => {
                    attrData[key] = childAttr[key];
                });
                Object.keys(childJson).forEach((key) => {
                    if (jsonData[key]) {
                        if (Array.isArray(jsonData[key])) {
                            jsonData[key].push(childJson[key]);
                        } else {
                            jsonData[key] = [
                                jsonData[key],
                                childJson[key]
                            ];
                        }
                    } else {
                        jsonData[key] = childJson[key];
                    }
                });
            } else {
                const key = child.nodeName.toLowerCase();
                // eslint-disable-next-line no-lonely-if
                if (jsonData[key]) {
                    if (Array.isArray(jsonData[key])) {
                        jsonData[key].push({ key: child.innerHTML });
                    } else {
                        jsonData[key] = [
                            jsonData[key],
                            child.innerHTML
                        ];
                    }
                } else {
                    jsonData[key] = child.innerHTML;
                }
            }
        }
        return [json, attr];
    }

    xmlToJson(xmlString = '<empty/>', withAttributes = false) {
        const virtualDom = document.createElement('DIV');
        virtualDom.innerHTML = xmlString;
        const [json, attr] = this.#processXml(virtualDom);
        if (!withAttributes) {
            return json.div;
        }
        delete attr.div._attributes;
        return {
            json: json.div,
            attributes: attr.div
        };
    }

}
