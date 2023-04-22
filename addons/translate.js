import e from "express";
import fetch from "node-fetch";

// let FID = 'aje8ngombb6etr7mtfj5'
let FID = 'b1gj6bs42ur8i6es32r7'
let IAMT = '';
let OAuth = 'AQAAAAAZBZq2AATuwUwrJc019UsZt1vM6Z4XobI';

class Trans {
    IAMT = '';
    OAuth = 'AQAAAAAZBZq2AATuwUwrJc019UsZt1vM6Z4XobI';
    FID = 'b1gj6bs42ur8i6es32r7'

    maketranslate(text, lang_from, lang_to) {
        let url = `https://translate.api.cloud.yandex.net/translate/v2/translate`
        let data = {
            "sourceLanguageCode": lang_from,
            "targetLanguageCode": lang_to,
            "texts": [
                text
            ],
            "folderId": this.FID
        }
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.IAMT}`
            },
            body: JSON.stringify(data)
        })
    }

    async getIAMT() {
        let url = `https://iam.api.cloud.yandex.net/iam/v1/tokens`
        let data = {
            "yandexPassportOauthToken": this.OAuth
        }
        let res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        let json = await res.json()
        this.IAMT = json.iamToken
    }

    async translate(text, lang_from = 'ru', lang_to = 'en') {
        let res = await this.maketranslate(text, lang_from, lang_to)
        // console.log('res', res);
        if (res.status === 401) {
            await this.getIAMT()
            res = await this.maketranslate(text, lang_from, lang_to)
        }
        let json = await res.json()
        try {
            return json['translations'][0]['text']
        }catch(e) { 
            return null
        }
    }
    
}

export let TR = new Trans()


export default TR;