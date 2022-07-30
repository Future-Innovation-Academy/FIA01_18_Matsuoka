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


function App() {

  //トランプの型
  type cardType = {
    image: string,
    images: { png: string, svg: string },
    value: string,
    suit: string,
    code: string
  }

  //コレクションの型
  type collectionData = {
    gameFlag: boolean,
    sumNum: number,
    deck_id: string,
    card: cardType,
    preCardList: cardType[],
    cardList: cardType[],
  }

  const [data, setData] = useState<collectionData[]>([
    {
      gameFlag: false,
      sumNum: 0,
      deck_id: "",
      card: {
        image: "",
        images: { png: "", svg: "" },
        value: "",
        suit: "",
        code: ""
      },
      preCardList: [],
      cardList: []
    }],
  );

  //モーダルの開閉用
  const [open, setOpen] = useState<boolean>(false);

  //コレクションの情報取得
  const q = collection(db, "kadai_20220731");
  const docRef = doc(q, "LGZFoHVn0IDnR2tyRxAy");

  //ゲーム終了時処理
  const gameClose = (): void => {
    setOpen(false)

    //ページのリロード
    window.location.reload()
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
        updateDoc(docRef, { sumNum: 0 });
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

  //コレクションの値を同期
  useEffect(() => {
    //2.1 query=コレクション(firebaseのデータが入る箱のこと)
    const q = query(collection(db, "kadai_20220731")); //データにアクセス

    // 2.2
    const unsub = onSnapshot(q, (QuerySnapshot) => {
      setData(
        QuerySnapshot.docs.map((doc) => ({
          gameFlag: doc.data().gameFlag,
          sumNum: doc.data().sumNum,
          deck_id: doc.data().deck_id,
          card: doc.data().card,
          preCardList: doc.data().preCardList,
          cardList: doc.data().cardList,
        }))
      );
    });
    return () => unsub();
  }, []);


  const gameStart = async () => {

    //トランプのシャッフル
    const response = await fetch(
      "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
    ).then((res) => res.json())
      .then((data) => {
        updateDoc(docRef, { deck_id: data.deck_id });
        // setdeckID(data.deck_id);
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
        updateDoc(docRef, { sumNum: (data[0].sumNum + tmpNumber)});
      });
  }

  return (
    <div className="App">

      <h1>Don't exceed 100！</h1>

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
            minWidth: '400px',
            maxHeight: '70%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Box textAlign="center">
            <DialogTitle>You Lose...</DialogTitle>
            <DialogContent>
              <DialogContentText>Please close the modal to restart the game</DialogContentText>
            </DialogContent>
          </Box>
        </Paper>
      </Modal>

    </div >
  )
}

export default App
