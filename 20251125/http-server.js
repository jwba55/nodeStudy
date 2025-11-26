import { createServer } from 'node:http';

//참조하는 것: 메모리 어딘가에 실제 객체가 존재하는데 그것을 가르킴.
//let = 가변 변수 (대상 객체 자체를 변경할 수 있음.-가변), const = 불변 변수(객체 자체는 변하지 않고 내용물을 변경할 수 있음.-불변)
//const로 사용해서 작업후 작동시켰을때 문제가 생기면 해당 부분을 let으로 변경해주기
let list = [];

//시퀀스 선언 및 초기화
let seq = 0;

for(let i = 0; i< 10 ; i++){
    list.push({
        bookid: ++seq,
        bookname: `도서명 ${seq}`,
        publisher: `출판사 ${seq}`,
        price: 1000 * seq
    });
}

// 서버 생성 및 요청 처리
const server = createServer((req, res) => { //요청을 받아오는데 사용자가 보내주는 데이터의 양이 얼마나 될지 모름.
    //동기처리는 한번에 읽을 수 있지만 비동기 처리이기 때문에 이벤트로 읽고 집어넣는 것을 반복.
    req.setEncoding("utf-8"); // 요청 바디의 인코딩을 UTF-8로 설정
    res.writeHead(200, { 'Content-Type': 'application/json' }); // 응답 헤더를 JSON 타입으로 설정

    const body = [];
    //이벤트 발생: 읽을 것이 있음. 요청이 읽힐 때마다 body 배열에 저장
    req.on("readable", () => {
        let chunk;
        while (null !== (chunk = req.read())){  //읽을 데이터를 요청(조각의 데이터를 읽음) 대기상태x
            body.push(chunk);   //읽을 때마다 하나씩 body 배열에 추가
        }
    }); //비동기 처리 방식: 읽을 것이 없으면 다른 일을 하고 있음.


    //비동기 처리란? 끝날 때의 처리를 생각하는 것.
    //다 읽고 난후 end 발생
    req.on("end", () => {
        if(req.method === "POST"){  //요청 메소드 확인
            if(body){   //body 데이터 확인
                const item = JSON.parse(body);  //요청 바디를 파싱하여 JSON 객체로 반환 - 배열에 있는 애들을 연결해서 하나의 문자열로 만든 다음 문자열 파싱해서 객체로 생성.

                if(item) {  //파싱된 객체가 존재할 경우
                    item.bookid = ++seq;    //새로운 시퀀스 할당
                    list.push(item);    //리스트에 항목 추가
                }
            }
        } else if(req.method === "DELETE"){
            const bookid = req.url.split("/").at(-1);   //url에서 마지막 부분을 id로 간주(spring에서 하던 pv같은 역할)

            if(bookid){ //if의 경우 인터렉팅을 시킴.
                //요즘은 for를 잘 사용하지 않음.(데이터의 길이를 확인할 수가 없음)
                //stream 방식을 쓰면 코어 갯수만큼 나눠서 병렬 처리 후 다시 병합함.(동시성) - kotlin의 kortin과 같은것 - 자바에서도 이 같은 기술이 등장하는 중이다.
                //javascript 배열 함수
                list = list.filter(value => value.bookid != bookid);    //value값을 람다식으로 던져서 어떤 데이터를 꺼낼지 판정함.
                //사용자가 삭제 요청한 bookid와 일치하지 않은것만 선택해서 새로운 배열을 구성.
                //불변: 순서에 구애받지 않아도 됨(동시성)
            }
        } else if(req.method === "PUT"){    //put과 patch의 차이 put은 전체 교체 patch는 일부 교체
            const item = JSON.parse(body); //요청 바디를 JSON 객체로 파싱

            if(item) {
                //원래의 위치에 넣지 않아도 된다고 가정한다면의 코드
                // 기존 id에 해당하는 항목을 리스트에서 삭제 후
                list = list.filter(value => value.bookid != item.bookid);//본래의 list는 그대로 있고 새로운 list를 생성하는 형태☆
                // 업데이트된 항목을 리스트에 추가
                list.push(item);
            }
        } else if(req.method === "GET") {
            const bookid = req.url.split("/").at(-1);
            console.log(bookid);

            if(bookid){
                const item = list.find(value => value.bookid == bookid);   //결과적으로 동시성을 갖지는 않음.

                if(item){
                    res.end(JSON.stringify(item));//item을 못 찾을 수도 있음
                } else {
                    res.end("{}");
                }
                

                return;
            }
        }
        // 리스트를 id 순서로 정렬 (오름차순)
        list.sort((left, right) => left.bookid - right.bookid); //데이터가 어떤식으로 나오든간에 데이터 전송전에 순서대로 정렬하도록 설정

        res.end(JSON.stringify(list));
    });

});

// 서버가 지정된 포트와 호스트에서 요청을 듣기 시작
server.listen(3000, '0.0.0.0', () => { //포트를 보내고나서 다시 대기함
    console.log(`Listening on localhost:3000`); // 서버가 실행 중임을 콘솔에 출력
});