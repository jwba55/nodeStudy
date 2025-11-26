import { createServer } from "node:http"
import express from "express"

const port = 3000;
const host = "127.0.0.1";

const app = express(); //express 객체생성

//미들웨어란? 필터와 같은 역할
//("public")폴더에 있는 static 컨텐츠를 처리하는 미들웨어
app.use(express.static("public")); //미들웨어를 사용하겠다
    // 하는 역할:
    //     static처리:
    //         동기처리:
    //             - 그냥 읽고 보내기만 하면 됨.
    //         비동기처리
    //             - 이벤트가 발생할 때마다 static 컨텐츠를 처리함.



//json 문자열을 req.body 객체로 변환해주는 미들웨어
app.use(express.json());    //JSON.parse(req.body);이걸 대신 해줌
//@RequestBody와 같은 역할

let list = [];
let seq = 1;
let msg = "";
const book = req.body;

for(let i = 0; i< 10 ; i++){
    list.push({
        bookid: ++seq,
        bookname: `도서명 ${seq}`,
        publisher: `출판사 ${seq}`,
        price: 1000 * seq
    });
}

//중복 식 모듈화
const sendList = (req, res, msg) => {    //람다식을 담음
    res.writeHead(200,{"Content-Type": "application/json; charset=utf8"});  //예전에는 utf-8설정을 해줘야했지만 지금은 안해줘도 자동으로 잡힘.
    if (req.method === 'GET') { //get 메소드일 때만 실행
        list.sort((left, right) => left.bookid - right.bookid);
    }

    const resObject = {
        message: msg,
        data: list
    }

    res.end(JSON.stringify(resObject));
};

app.get("/", sendList)

app.get("/book:bookid",(req,res)=> {
    const { bookid } = req.params;

    list = list.filter(item => item.bookid == bookid);

    if(list != null && list != undefined){
        msg = "해당 도서를 불러왔습니다.";
    }

    sendList(req, res, msg);
})

app.post("/book", (req,res) =>{

    book.bookid = seq++;
    
    list.push(book);

    sendList(req, res, msg);
});

app.put("/book", (req,res) =>{

    list = list.filter(value => value.bookid != book.bookid);
    
    list.push(book);

    sendList(req, res, msg);
});

app.delete("/book/:bookid", (req, res)=>{ //:파라미터 값 = Spring의 @PathVariable을 사용하는 것과 같음.
    //여러개의 키 값중에서 bookid라는 애의 값만 받아서 집어넣어줌
    const { bookid } = req.params;

    list = list.filter(item => item.bookid != bookid);   //id 값이 일치하지 않는 애들로만 구성된 배열을 재구성함

    sendList(req, res, msg);

    // res.end({
    //     code: 1000,
    //     body: {
    //         msg: `${bookid}번 도서가 삭제되었습니다.`
    //     }
    // })   현업에서는 이런 방식으로 사용함.
});

createServer(app).listen(port, host, () => {
    console.log(`접속하세요 : http://${host}:${port}`);
});