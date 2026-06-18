import * as fs from "node:fs/promises"

const searchQuerySchema = {
        drive: null,
        folder: null,
        includeFileTypes: [],
        excludeFileTypes: [],
        createdFrom: null,
        createdTo: null,
        modifiedFrom: null,
        modifiedTo: null,
        minSizeMB: null,
        maxSizeMB: null,
        filenameKeywords: [],
        contentKeywords: [],
        sortBy: null,
        sortOrder: null,
        limit: null
    };

export async function searchFiles(filters){ //"filters" is the json return by the AI api.
    const query = {
        ...searchQuerySchema,  //The spread operator is used here to merge the filters and the schema into a single variable.
        ...filters
    }
    const normalizeFilter = (data) => { // Used to ensure the json format is correct.
        
    }

}