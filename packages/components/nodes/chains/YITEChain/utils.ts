import { ICommonObject } from '../../../src/Interface'
import { Document } from "@langchain/core/documents";

function constructFakeLink (provider: string, productId: string): string {
    // this function will construct fake link in format: https://{provider}.sg/{product_id}.
    // We will use this function to replace the real link in the output.
    return `https://${provider}.sg/${productId}`;
}

function getProductIDFromLink (link: string): string {
    // this function will extract product id from the link.
    // We will use this function to replace the product id in the output.
    const parts = link.split('/');
    return parts[parts.length - 1];
}

function parseStrToJson(inputStr: string): ICommonObject {
    // Parse the extraInfo string to JSON
    let inputJson: ICommonObject = {}
    if (inputStr) {
        try {
            inputJson = typeof inputStr === 'object' ? inputStr : JSON.parse(inputStr)
        } catch (exception) {
            throw new Error("Invalid JSON in the Route output values: " + exception)
        }
    }
    return inputJson
}

function getRouteOutput(extraInfoStr: string): ICommonObject {
    const extraInfo = parseStrToJson(extraInfoStr)
    const routeOutputStr = extraInfo?.routeOutput
    return parseStrToJson(routeOutputStr)
}

function prepareContext(retrievedContext: string[]): string {
    return retrievedContext.join("\n").replace("\n\n", "\n")
}

function getProductIDsFromDocs(retrievedDoc: Document[]): string[] {
    return retrievedDoc.map((doc) => doc.metadata["product_id"]);
}

function postprocessOutput(output: string, productIdGroup: Record<string, any[]>): string {
    // Replace the fake link in the output with the real link
    for (const [productId, rows] of Object.entries(productIdGroup)) {
        rows.forEach((row) => {
            let fakeLink = constructFakeLink(row.provider, productId)
            output = output.replace(new RegExp(fakeLink, 'g'), row.link)
        })
    }

    return output;
}


export { constructFakeLink, getRouteOutput, getProductIDsFromDocs, prepareContext, postprocessOutput };