
import * as randomUseragent from 'random-useragent';
// var XMLHttpRequest = require('xhr2');
class Wildberries{
  constructor(id, link) {
    this.id = id;
    this.link = link;
  }

  async findDontAnswered(slice){
    const dataSend = `{"imtId": ${this.id}, "take": 30, "skip": ${slice}}`
    console.log(dataSend, this.link);
    const response = await fetch(this.link, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': randomUseragent.getRandom()
      },
      body: dataSend
    })
      .then((response) => response.json())
    let mass = []
    for (const [key, value] of Object.entries(response['feedbacks'])){
          // console.log(value['answer']);
          if(value['answer']){
            mass.push(value)
          }
        }
    return mass
  }

  async main(){
    const response = await fetch(this.link, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': randomUseragent.getRandom()
      },
      body: (`{"imtId": ${this.id}, "take": 30, "skip": 0}`)
    })
      .then((response) => response.json())
      // .then((data) => console.log(data));
    console.log(typeof response)
    console.log(Object.keys(response))
    for (let slice = 0; slice <= response['feedbackCount']; slice += 30) {
      console.log(slice)
      let rese = await this.findDontAnswered(slice)
      console.log(rese)
      // break
    }
  }
}

WB = new Wildberries(id=9260821, link='https://feedbacks.wildberries.ru/api/v1/summary/full')
WB.main()