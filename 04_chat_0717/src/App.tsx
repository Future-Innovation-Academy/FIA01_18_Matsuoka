import { useState, useEffect } from "react";
import "./App.css";
import { Button, CardActions, CardContent, DialogContent, DialogContentText, DialogTitle, Modal, Paper, Typography } from '@mui/material'
import './index.css'

// firebaseを使うために用意されているおまじないを読み込む
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  QuerySnapshot,
} from "firebase/firestore";

import { db, auth } from "./firebase";
import Avatar from "boring-avatars";
import { Box } from "@mui/system";

function App() {

  type users = {
    id: string
    name: string,
    email: string
  }

  const addData = async () => {
    // 処理を記述していきます🤗
    // alert(1); 記述後、送信ボタンを押す→画面に変化があればコメントアウトしましょう🤗

    // firebaseへの登録の処理
    await addDoc(
      collection(db, "kadai_20220724"), //場所どこ？
      {
        name: nameValue,
        email:emailValue,
      }
    );

    // 文字を空にします🤗
    setNameValue("");
    setEmailValue("");
  };


  const [nameValue, setNameValue] = useState<string>("");
  const [emailValue, setEmailValue] = useState<string>("");

  const [data, setData] = useState<users[]>([
    {
      id: "",
      name: "",
      email: "",
    },
  ]);

  //会員モーダルの開閉用
  const [memberOpen, setMemberOpen] = useState<boolean>(false);

  //会員の名前
  const [memberName, setMemberName] = useState<string>("");

  //会員のメールアドレス
  const [memberEmail, setMemberEmail] = useState<string>("");


  useEffect(() => {
    const q = query(collection(db, "kadai_20220724"));

    const unsub = onSnapshot(q, (QuerySnapshot) => {
      setData(
        QuerySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          email: doc.data().email,
        }))
      );
    });
    return () => unsub();
  }, []);

  const handleInputNameChange = (e: any) => {
    setNameValue(e.target.value);
  };

  const handleInputEmailChange = (e: any) => {
    setEmailValue(e.target.value);
  };

  const memberInfo = (name: string, email: string) => {

    setMemberName(name);

    setMemberEmail(email);

    setMemberOpen(true);
  }


  return (
    <div className="App">

      <div className="menu">
        <Button variant="outlined" color="secondary">Home</Button>
        <Button variant="outlined" color="secondary">Sign in</Button>
        <Button variant="outlined" color="secondary">Sign up</Button>
      </div>

      <hr className="space-y-2" />

      <h2 className="text-2xl text-rose-700 space-y-20">〇〇コミュニティ　会員一覧</h2>

      {/* 表示のロジック */}
      <div className="icon">
        {data.map((item, index) => (
          <div key={index} className="child">
            <div onClick={() => memberInfo(item.name, item.email)} >
              <Avatar
                size={40}
                name={item.name}
                variant="beam"
                colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
              />
            </div>
          </div>
        ))}

        <Modal
          open={memberOpen}
          onClose={() => setMemberOpen(false)}
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
              <DialogContent>
                <p>名前：{memberName}</p>
                <p>email：{memberEmail}</p>
              </DialogContent>
            </Box>
          </Paper>
        </Modal>

      </div>

      <hr />

      <p className="text-xl text-rose-700 space-y-20">今すぐ会員登録！</p>

        <p>名前：<input type="text" value={nameValue} onChange={handleInputNameChange} /></p>
        <p>メールアドレス：<input type="text" value={emailValue} onChange={handleInputEmailChange} /></p>
        {/* 送信のボタンを記述 */}
        <div>
          <Button onClick={addData}>会員登録</Button>
        </div>

    </div>
  )
}

export default App
