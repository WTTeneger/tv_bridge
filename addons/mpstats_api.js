"use strict";
import fetch from "node-fetch";
import stringify from "qs-stringify";
const API_URL = "https://mpstats.io/api";

class mpstatsAPI {
    constructor() {
        this._url = API_URL;
        this._token = '63208606f26c12.4848400024b48a6e97ae54db4ed731f74a90e28c'
    }

    generateHeaders() {
        return {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Origin": "https://mpstats.io/api",
            'X-Mpstats-TOKEN': this._token,
            'Content-Type': 'application/json'
        }
    }

    async makeRequest(method, path, data = {}, params = {}) {
        const myHeaders = this.generateHeaders()
        try {
            const this_url = this._url + path + stringify(params);
            var raw = JSON.stringify(data);
            // console.log(raw);

            var requestOptions = {
                method: method,
                headers: myHeaders,
                redirect: 'follow'
            };
            if (method != "GET" && method != "HEAD") {
                requestOptions.body = raw;
            }

            // console.log(this_url);
            let response = await fetch(`${this_url}`, requestOptions)

            // console.log(response.headers.get('set-cookie'));
            const contentType = response.headers.get("content-type");
            if (contentType &&
                contentType.indexOf("application/json") !== -1) {
                return await response.json()
            } else {
                throw response.statusText
            }
        } catch (e) {
            console.log(e);
            return null;
        }

    }


    // https://seller.wildberries.ru/passport/api/v2/auth/login
    async stats_by_keywords(params) {
        if (!params) {
            return new Error("missing params");
        }
        if (!params.itemid) { 
            return new Error("missing itemid");
        }
        if (!params.d1) { 
            return new Error("missing d1");
        }
        if (!params.d2) {
            return new Error("missing d2");
        }
        let f = true
        if (params.full) f = params.full 

        

        return this.makeRequest("GET", `/wb/get/item/${params.itemid}/by_keywords?`, {}, {
            'd1': params.d1,
            'd2': params.d2,
            'full': f
        });
    }


    /// ------------- VERSIONS -----------------
    // https://mpstats.io/api/wb/get/item/74542020/full_page/versions
    async get_item_full_page_versions({ article }) {
        if (!article) { 
            return new Error("missing article");
        }
        return await this.makeRequest("GET", `/wb/get/item/${article}/full_page/versions`, {}, {});
    }

    // https://mpstats.io/api/wb/get/item/74542020/full_page?version=dbf46729b5cfdc49e5989b818b6f597a
    async get_item_full_page({ article, version }) {
        if (!article) { 
            return new Error("missing article");
        }
        if (!version) { 
            return new Error("missing version");
        }
        return this.makeRequest("GET", `/wb/get/item/${article}/full_page?`, {}, {
            'version': version
        });
    }

    // https://mpstats.io/api/wb/get/item/74542020/full_page
    async get_item_full_page_last({ article, vLeft, vRight, diffType }) {
        if (!article) { 
            return new Error("missing article");
        }
        if (!vLeft) { 
            return new Error("missing vLeft");
        }
        if (!vRight) {
            return new Error("missing vRight");
        }
        
        let data = {
            "vLeft": vLeft,
            "vRight": vRight,
            "diffType": diffType ?? 'Inline' //SideBySide, Inline
        }

        // data = {
        //     "vLeft": "dbf46729b5cfdc49e5989b818b6f597a",
        //     "vRight": "7718afa0aa88d7f46d877401558c35ff",
        //     "diffType": "Inline" //SideBySide, Inline
        // }
        return this.makeRequest("POST", `/wb/get/item/${article}/full_page?`,  data, {});
    }

    // https://mpstats.io/api/wb/get/item/74542020/photos_history
    async get_item_photos_history({ article }) {
        if (!article) { 
            return new Error("missing article");
        }
        return this.makeRequest("GET", `/wb/get/item/${article}/photos_history`, {}, {});
    }


}




let MPstatsAPI= new mpstatsAPI();

// console.log(await a.stats_by_keywords());


export default MPstatsAPI;