import { Button, Dialog, DialogContent, DialogContentText, DialogTitle, Modal, Paper } from '@mui/material'
import { Box } from '@mui/system'
import { useState, useEffect } from 'react'
import './App.css'
import {
  doc,
  getDoc,
  collection,
  query,
  onSnapshot,
  updateDoc,
  addDoc,
  QuerySnapshot,
} from "firebase/firestore";
import { db, auth } from "./firebase"; //.envに書かれているfirebaseに接続するためのもの
import { onAuthStateChanged } from "firebase/auth";
import { signInWithRedirect } from "firebase/auth";
import { getRedirectResult, GoogleAuthProvider } from "firebase/auth";

function App() {

  //認証ロジック
  const provider = new GoogleAuthProvider();
  const clickLogin = function () {
    signInWithRedirect(auth, provider);
  }
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        console.log(result);
        if (result !== null) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential?.accessToken;
          // console.log(token,"token");
          // The signed-in user info.
          const user = result.user;
          // console.log(user,"user");
          // console.log(user.uid,"userid");
          // updateDoc(docRef, { user: [...data[0].user,user.photoURL] });
          setYou(String(user.photoURL));
        }
      }).catch((error) => {
        console.error(error);
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.email;
        // console.error(errorCode);
        // console.error(errorMessage);
        // console.error(email);
        // The AuthCredential type that was used.
        //const credential = GoogleAuthProvider.credentialFromError(error);
      });
  }, []);


  //トランプの型
  type cardType = {
    image: string,
    images: { png: string, svg: string },
    value: string,
    suit: string,
    code: string,
  }

  //コレクションの型
  type collectionData = {
    gameFlag: boolean,
    sumNum: number,
    preSumNum:number,
    deck_id: string,
    card: cardType,
    preCardList: cardType[],
    cardList: cardType[],
    user:string,
    preUser:string,
  }

  const [data, setData] = useState<collectionData[]>([
    {
      gameFlag: false,
      sumNum: 0,
      preSumNum:0,
      deck_id: "",
      card: {
        image: "",
        images: { png: "", svg: "" },
        value: "",
        suit: "",
        code: ""
      },
      preCardList: [],
      cardList: [],
      user:"",
      preUser:"",
    }],
  );

  //モーダルの開閉用
  const [open, setOpen] = useState<boolean>(false);

  //r－るのモーダル開閉用
  const [openRule, setOpenRule] = useState<boolean>(false);

  //現在の認証者
  const [you, setYou] = useState<string|undefined>(undefined);

  //コレクションの情報取得
  const q = collection(db, "kadai_20220731");
  const docRef = doc(q, "LGZFoHVn0IDnR2tyRxAy");

  //ゲーム終了時処理
  const gameClose = (): void => {
    setOpen(false)
  }

  //トランプの数の総和が特定の値を超えたらゲーム終了のモーダルをオープンする。
  useEffect(
    () => {
      if (data[0].sumNum > 100) {
        setOpen(true)

        //コレクションの値の初期化
        updateDoc(docRef, { gameFlag: false });
        updateDoc(docRef, { preCardList: [] });
        updateDoc(docRef, { cardList: [] });
        updateDoc(docRef, { deck_id: "" });
        updateDoc(docRef, {
          card: {
            image: "",
            images: { png: "", svg: "" },
            value: "",
            suit: "",
            code: ""
          }
        });
      }
    }, [data[0].sumNum]
  )

  //コレクションの値を画面と同期
  useEffect(() => {
    const q = query(collection(db, "kadai_20220731"));

    const unsub = onSnapshot(q, (QuerySnapshot) => {
      setData(
        QuerySnapshot.docs.map((doc) => ({
          gameFlag: doc.data().gameFlag,
          sumNum: doc.data().sumNum,
          preSumNum:doc.data().preSumNum,
          deck_id: doc.data().deck_id,
          card: doc.data().card,
          preCardList: doc.data().preCardList,
          cardList: doc.data().cardList,
          user:doc.data().user,
          preUser:doc.data().preUser,
        }))
      );
    });
    return () => unsub();
  }, []);


  const gameStart = async () => {

    //スコアはゲーム開始と同時に初期化
    updateDoc(docRef, { sumNum: 0 });
    updateDoc(docRef, { preSumNum: 0 });



    //トランプのシャッフル
    const response = await fetch(
      "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
    ).then((res) => res.json())
      .then((data) => {
        updateDoc(docRef, { deck_id: data.deck_id });
      });

    //ゲーム開始フラグをtrueにする。
    updateDoc(docRef, { gameFlag: true });
  }

  const hitCard = async () => {
    //カードを一枚引く＾
    const response = await fetch(
      `https://deckofcardsapi.com/api/deck/${data[0].deck_id}/draw/?count=1`
    ).then((res) => res.json())
      .then((cdata) => {
        updateDoc(docRef, { card: cdata.cards[0] });

        updateDoc(docRef, { preCardList: [...data[0].cardList] });

        updateDoc(docRef, { cardList: [...data[0].cardList, cdata.cards[0]] });

        //一つ前にカードを引いたユーザ情報を格納する。認証が無い場合は名無しを入れる。
        if(data[0].user !== undefined){
          updateDoc(docRef, { preUser: data[0].user });
        } else {
          updateDoc(docRef, { preUser:"nanashi" });
        }

        //今カードを引いたユーザの情報を格納する。認証が無い場合は名無しを入れる。
        if(you !== undefined){
          updateDoc(docRef, { user: you });
        } else {
          updateDoc(docRef, { user: "nanashi" });
        }

        //レスポンスの数値変換をする
        let tmpNumber: number = 0;
        switch (cdata.cards[0].value) {
          case "ACE":
            tmpNumber = 1;
            break;
          case "JACK":
            tmpNumber = 11
            break;
          case "QUEEN":
            tmpNumber = 12
            break;
          case "KING":
            tmpNumber = 13
            break;
          default:
            tmpNumber = Number(cdata.cards[0].value);
        }
        updateDoc(docRef, { preSumNum: (data[0].sumNum) });
        updateDoc(docRef, { sumNum: (data[0].sumNum + tmpNumber) });
      });
  }

  return (
    <div className="App">

      <h2>Don't exceed 100！</h2>

      {(data[0].gameFlag === false) ? "" : <p>今引いたカード</p>}
      {/* 直前に引いたカード表示 */}
      <div className="hitCard">
        <img src={data[0].card.image} />
      </div>

      {(data[0].gameFlag === false) ? "" : <p>今までに引いたカード</p>}
      {/* 今までに引いたカードをすべて表示 */}
      <div className="cardListContainer">
        {data[0].preCardList.map((preCard, index) => (
          <div key={index} className="card">
            <img src={preCard.image} />
          </div>
        ))}
      </div>

      {
        (data[0].gameFlag === false) ?
          //ゲーム開始前の表示
          <Button variant="contained" onClick={gameStart}>Game Start</Button>
          //ゲーム開始後の表示
          : <Button variant="contained" color="success" onClick={hitCard}>Hit Card</Button>
      }
      　<Button className="rule" variant="contained" onClick={()=>setOpenRule(true)}>Rule</Button>
      <div>
        <button className="authentication" onClick={() => clickLogin()}>Google authentication</button>
      </div>

      <Modal
        open={open}
        onClose={() => gameClose()}
      >
        <Paper
          style={{
            left: '50%',
            top: '50%',
            position: 'absolute',
            maxWidth: '100%',
            minWidth: '500px',
            maxHeight: '70%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Box textAlign="center">
            <DialogTitle>
            {(data[0].gameFlag === true)&&("Please close the modal to go to next game...")}
            {(data[0].gameFlag === false)&&("Game finished!")}


              </DialogTitle>
            <DialogContent>
              <DialogContentText>
                {/* 次のゲームが始まっている場合は下記を表示する */}
                {(data[0].gameFlag === true)?"Next game has already started...":"" }

                {/* 次のゲームが始まっていない場合にスコア結果を表示する。 */}
                {(data[0].gameFlag === false)&&
                // 認証していないメンバの場合は名無しでそうでない場合は認証者のアイコン表示
                (<span>Winner：{((data[0].preUser === "nanashi")?"名無し":
                <img src={data[0].preUser} style={{height:'30px',width:'30px'}}/>)} {data[0].preSumNum}Points!</span>)}
                </DialogContentText>
                
                <DialogContentText>
                {/* 次のゲームが始まっていない場合にスコア結果を表示する。 */}
                {(data[0].gameFlag === false)&&
                // 認証していないメンバの場合は名無しでそうでない場合は認証者のアイコン表示
                (<span>Loser  ：{((data[0].user === "nanashi")?"名無し":
                <img src={data[0].user} style={{height:'30px',width:'30px'}} />)} {data[0].sumNum}Points!</span>)}
                </DialogContentText>
            </DialogContent>
          </Box>
        </Paper>
      </Modal>

      {/* ルール表示モーダル */}
      <Modal
        open={openRule}
        onClose={() => setOpenRule(false)}
      >
        <Paper
          style={{
            left: '50%',
            top: '50%',
            position: 'absolute',
            maxWidth: '100%',
            minWidth: '800px',
            maxHeight: '70%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Box textAlign="center">
            <DialogTitle>■ルール説明</DialogTitle>
            <DialogContent>
            <DialogContentText>・トランプを次々に引き、カードの値の総数で100を超えてしまった人は負け！</DialogContentText>
            <DialogContentText>・100を超える一つ直前にカードを引いていた人が勝ち！</DialogContentText>
            {/* 下記は改行用 */}
            <DialogContentText>　</DialogContentText>
            <DialogContentText>※Google認証をするとゲーム終了時に勝者・敗者のアイコンが表示されます。</DialogContentText>
            </DialogContent>
          </Box>
        </Paper>
      </Modal>


    </div >
  )
}

export default App
