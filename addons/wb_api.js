"use strict";
import fetch from "node-fetch";
import stringify from "qs-stringify";
const API_URL = "https://seller.wildberries.ru";

class wildberriesAPI {
    constructor(opts = {}) {
        this._url = opts.url || API_URL;
        this.WBToken = opts.WBToken || "";
        this.suppler = opts.suppler || "";
    }

    generateHeaders(addh) {
        return {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Origin": "https://seller.wildberries.ru",
            'Cookie': "WBToken=" + this.WBToken + "; x-supplier-id=" + this.suppler + '; x-supplier-id-external' + this.suppler,
            ...addh
        }
    }

    async makeRequest(method, path, data = {}, params = {}, cookies = false) {
        // если в path нет http
        if (path.indexOf('http') == -1) {
            if (!this.WBToken) {
                return new Error("missing WBToken");
            }
            if (!this.suppler) {
                return new Error("missing suppler");
            }
        }
        const myHeaders = this.generateHeaders({
            // "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        })
        let this_url;
        try {
            if (path.indexOf('http') !== -1) {
                this_url = path + stringify(params)
            } else {
                this_url = this._url + path + stringify(params);
            }
            var raw = JSON.stringify(data);
            // console.log(raw);
            var requestOptions = {
                method: method,
                headers: myHeaders,
                redirect: 'follow',
                // случайный userAgent

            };
            if (method != "GET" && method != "HEAD") {
                requestOptions.body = raw;
            }

            // console.log(this_url);
            let response = await fetch(
                this_url,
                requestOptions)

            // console.log(response.headers.get('set-cookie'));
            const contentType = response.headers.get("content-type");
            if (contentType &&
                contentType.indexOf("application/json") !== -1) {
                if (cookies !== false) {
                    let cookies_ = response.headers.get('set-cookie');
                    let cookie = cookies_.split(';').find(c => c.trim().startsWith(`${cookies}=`));
                    let cookie_data = cookie.split('=')[1];
                    return cookie_data;
                } else {
                    return await response.json()
                }
            } else {
                throw response.statusText
            }
        } catch (e) {
            return null;
        }

    }

    // auth introspect
    async authIntrospect() {
        return await this.makeRequest("GET", "/passport/api/v2/auth/introspect?");
    }

    // get suppliers
    async getSuppliers(params) {
        return await this.makeRequest("POST", "/ns/suppliers/suppliers-portal-core/suppliers?",
            [
                { "method": "getUserSuppliers", "params": {}, "id": "json-rpc_3", "jsonrpc": "2.0" },
                { "method": "listCountries", "params": {}, "id": "json-rpc_4", "jsonrpc": "2.0" }
            ]
        );
    }

    // get TableList
    async getTableList(params) {
        return await this.makeRequest("POST", "/ns/viewer/content-card/viewer/tableList",
            { "sort": { "limit": 10, "offset": 0, "searchValue": "", "sortColumn": "updateAt", "ascending": false } }
        );
    }

    // get feedbacks
    async getFeedbacks(params) {
        this.authIntrospect()
        return await this.makeRequest("GET", "/ns/api/suppliers-portal-feedbacks-questions/api/v1/feedbacks?", {},
            {
                'hasSupplierComplaint': '',
                'isAnswered': params?.isAnswered || false,
                'metaDataKeyMustNot': 'norating',
                'nmId': params?.nmId || '',
                'order': 'dateDesc',
                'skip': params?.skip || 0,
                'take': params?.take || 50
            }
        );
    }

    // set wasViewed
    async setWasViewed(params) {
        return await this.makeRequest("PATCH",
            "/ns/api/suppliers-portal-feedbacks-questions/api/v1/feedbacks",
            {
                id: params.id,
                wasViewed: true
            },
        );
    }

    // https://seller.wildberries.ru/passport/api/v2/auth/grant
    async authGrant() {
        return await this.makeRequest("POST", "/passport/api/v2/auth/grant?")
    }

    // https://seller.wildberries.ru/passport/api/v2/auth/login
    async authLogin(params) {
        return await this.makeRequest("POST", "/passport/api/v2/auth/login?", {
            token: params.token,
            device: "Macintosh,Yandex Browser 22.9"
        }, {}, 'WBToken');
    }

    // get questions
    async getQuestions(params) {
        this.authIntrospect()
        return await this.makeRequest("GET", "/ns/api/suppliers-portal-feedbacks-questions/api/v1/questions?", {},
            // params
            {
                'hasSupplierComplaint': '',
                'isAnswered': params?.isAnswered || false,
                'metaDataKeyMustNot': 'norating',
                'nmId': params?.nmId || '',
                'order': 'dateDesc',
                'skip': params?.skip || 0,
                'take': params?.take || 50
            }
        );
    }

    // add answer
    async addAnswerToFeedback(params) {
        this.authIntrospect()
        return await this.makeRequest("PATCH", "/ns/api/suppliers-portal-feedbacks-questions/api/v1/feedbacks?", {
            "id": params.id,
            "text": params.text
        });
    }

    // refresh token 
    async refreshToken(params) {
        let rt = await this.authGrant();
        let dt = await this.authLogin(rt)
        console.log(`RefreshToken - ${dt}`);
        return dt
    }

    // get rating products
    static async getRatingProducts(params) {
        if (!params?.text) {
            return new Error("missing text");
        }
        if (!params?.page) {
            return new Error("missing page");
        }
        params = {
            appType: "1",
            couponsGeo: "12,3,18,15,21",
            curr: "rub",
            dest: "-1029256,-102269,-2162196,-1257786",
            emp: "0",
            lang: "ru",
            locale: "ru",
            pricemarginCoeff: "1.0",
            query: params?.text || '',
            reg: "0",
            regions: "80,64,83,4,38,33,70,82,69,68,86,75,30,40,48,1,22,66,31,71,23",
            resultset: "catalog",
            sort: "popular",
            spp: "0",
            suppressSpellcheck: "true",
            page: params?.page || 1,
        }

        var myHeaders = {}
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        let url = `https://search.wb.ru/exactmatch/ru/common/v4/search?${stringify(params)}`
        let response = await fetch(url, requestOptions)
        return await response.json()
    }

    // add answer
    async addAnswerToQuestion(params) {
        this.authIntrospect()
        return await this.makeRequest("PATCH",
            "/ns/api/suppliers-portal-feedbacks-questions/api/v1/questions?", {
            "id": params.id,
            "answer": { "text": params.text },
            "state": "wbRu"
        });
    }

    async suppliersHomePageStats({ subrpc }) {
        // ns/mini-widgets/suppliers-home-page/
        // await this.authIntrospect()
        var raw = [];
        raw = [
            {
                "method": "widgets.supplyRating",
                "params": {},
                "id": "supply_rating",
                "jsonrpc": "2.0"
            },
            {
                "method": "widgets.ordersPerWeek",
                "params": {},
                "id": "orders_per_week",
                "jsonrpc": "2.0"
            },
            {
                "method": "widgets.saleItemQuantity",
                "params": {},
                "id": "sale_item_quantity",
                "jsonrpc": "2.0"
            },
            {
                "method": "widgets.defectPercent",
                "params": {},
                "id": "defect_percent",
                "jsonrpc": "2.0"
            },
            {
                "method": "widgets.goodsRating",
                "params": {},
                "id": "goods_rating",
                "jsonrpc": "2.0"
            },
            {
                "method": "widgets.feedbacksCount",
                "params": {},
                "id": "feedbacks_count",
                "jsonrpc": "2.0"
            },
            {
                "method": "widgets.questionsCount",
                "params": {},
                "id": "questions_count",
                "jsonrpc": "2.0"
            }
        ];
        let new_raw = [];
        if (subrpc) {
            for (let rw of raw) {
                if (subrpc.includes(rw.method)) {
                    new_raw.push(rw)
                }
                // если в массиве есть яблоко
            }
            raw = new_raw;
        }
        // console.log('ra', raw);
        let res = await this.makeRequest(
            "POST",
            "https://seller.wildberries.ru/ns/mini-widgets/suppliers-home-page/",
            raw);
        let retSl = {}
        if (!res) return retSl
        if (!Array.isArray(res)) return retSl
        for (let a of res) {
            retSl[a.id] = a
        }
        return retSl
    }

    // ns/api/suppliers-portal-feedbacks-questions/api/v1/parent-subjects
    async getSubjects() {
        return await this.makeRequest(
            'GET',
            '/ns/api/suppliers-portal-feedbacks-questions/api/v1/parent-subjects',
        )
    }

    // get rating средняя
    async getAverageRatingBySubjectId(subjectId) {
        return await this.makeRequest(
            'GET',
            `/ns/api/suppliers-portal-feedbacks-questions/api/v1/feedbacks/products/rating?subjectId=${subjectId}`
        )
    }

    // get max-min rating
    async getMaxMinRatingBySubjectId(subjectId) {
        return await this.makeRequest(
            'GET',
            `/ns/api/suppliers-portal-feedbacks-questions/api/v1/feedbacks/products/rating/top?subjectId=${subjectId}`
        )
    }

    async getArticleRating(article) {
        let re = await this.makeRequest("GET",
            `https://wbx-content-v2.wbstatic.net/ru/${article}.json`)
        if (re && re?.imt_id) {
            let rq = {}
            rq = await this.makeRequest(
                'GET',
                `https://feedbacks1.wb.ru/feedbacks/v1/${re?.imt_id}`
            )
            if (!rq?.valuation) {
                rq = await this.makeRequest(
                    'GET',
                    `https://feedbacks2.wb.ru/feedbacks/v1/${re?.imt_id}`
                )
            }
            return rq
        } else {
            return null
        }
    }

    // MinRatings
    async getMinRatingsFromAllSubjects(params) {
        let all_subjects = await this.getSubjects()
        let subjects_stats = {
        }
        if (params?.most) {
            subjects_stats = {
                most_low: {
                    valuation: 0
                },
                most_max: {
                    valuation: 0
                },
            }
        }
        for (let sub of all_subjects.data) {
            subjects_stats[sub.subjectId] = {
                ...sub
            }
            let verageRating = await this.getAverageRatingBySubjectId(sub.subjectId)
            console.log('verageRating', verageRating);
            subjects_stats[sub.subjectId].verageRating = verageRating
            let maxMinRating = await this.getMaxMinRatingBySubjectId(sub.subjectId)
            if (params?.most) {
                if (!maxMinRating.error) {
                    if (maxMinRating?.data?.productMaxRating) {
                        subjects_stats.most_max =
                            maxMinRating?.data?.productMaxRating?.valuation >= subjects_stats.most_max.valuation &&
                                maxMinRating?.data?.productMaxRating?.feedbacksCount > subjects_stats.most_max.feedbacksCount
                                ? maxMinRating?.data?.productMaxRating
                                : subjects_stats.most_max
                    }
                    if (maxMinRating?.data?.productMinRating) {
                        subjects_stats.most_low = maxMinRating?.data?.productMinRating?.valuation > subjects_stats.most_low.valuation
                            ? maxMinRating?.data?.productMinRating
                            : subjects_stats.most_low
                    }
                }
            }
            subjects_stats[sub.subjectId].maxMinRating = maxMinRating
        }
        return subjects_stats
    }

    // articles data

    static async getArticlesData(article) {

        // https://basket-02.wb.ru/vol145/part14539/14539224/info/ru/card.json
        let basket = 11
        while (true) {
            let bId = basket < 10 ? `0${basket}` : basket
            // какая ссылка будет при артикуле 74510122
            let params = {
                basket: `basket-${bId}`,
                vol: article.slice(0, -5) | 0,
                part: article.slice(0, -3) | 0,
                article: article,
            }

            var myHeaders = {}
            var requestOptions = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            };
            // https://basket-05.wb.ru/vol745/part74539/74539224/info/ru/card.json
            // https://basket-05.wb.ru/vol74539/part74539/74539224/info/ru/card.json

            let url = `https://${params.basket}.wb.ru/vol${params.vol}/part${params.part}/${params.article}/info/ru/card.json`
            console.log(url);
            let response = await fetch(url, requestOptions)
            if (response.status === 200) {
                return await response.json()
            }
            basket -= 1
            if (basket === 0) {
                return {}
            }
        }

    }


}


export default wildberriesAPI;