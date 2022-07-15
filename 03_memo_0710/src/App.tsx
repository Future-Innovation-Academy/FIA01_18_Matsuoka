import { Button, CardActions, CardContent, DialogContent, DialogContentText, DialogTitle, Modal, Paper, Typography } from '@mui/material'
import './App.css'
import classes from "./scss/app.module.scss"
import { Card } from '@mui/material';
import { Box } from '@mui/system';
import { useState,useEffect } from 'react';

function App() {
  
  const getData = () => {
    const data = localStorage.getItem("todoTask");
    if (data) {
      return JSON.parse(data);
    } else {
      return [];
    }
  };

  //タスクの型
  type todo = {
    id:number,
    title: string,
    content: string
  }

  // Todoアプリに使用する情報
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  // 登録されるデータを保持するuseState
  const [data, setData] = useState<todo[]>(getData);

  //編集用モーダルの開閉用
  const [editOpen, setEditOpen] = useState<boolean>(false);

  //編集用のタイトル・中身の一時格納先
  const [tmpTitle, setTmpTitle] = useState<string>("");
  const [tmpContent, setTmpContent] = useState<string>("");

  //何番目のモーダルかの情報格納用変数
  const [indexNum, setIndexNum] = useState<number>(0);

  //何番目のモーダルかの情報格納用変数
  const [count, setCount] = useState<number>(0);

  //編集ボタン押下処理
  const clickEditButton = (index: number) => {

    //編集用インデックスの取得
    setIndexNum(index);

    //編集モーダルオープン
    setEditOpen(true)
  }

  //削除用モーダルの開閉用
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  //削除ボタン押下処理
  const clickDeleteButton = (index: number) => {

    //編集用インデックスの取得
    setIndexNum(index);

    //編集モーダルオープン
    setDeleteOpen(true);
  }

  //削除処理実行
  const executeDelete = () => {

    //対象の配列を削除
    setData(data.filter(item => item.id !== indexNum));

    //削除用モーダルクローズ
    setDeleteOpen(false);
  }


  // 送信を押したら登録
  const handleAddSubmit = (e: any) => {
    //リロードを行わないようにする処理。
    e.preventDefault();

    // データを登録するための「塊＝オブジェクト」を作る
    let pushData: todo = {
      id:count,
      title,
      content,
    };
    setData([...data, pushData]);
    setTitle("");
    setContent("");

    //一意のidを生成するために、+1する。
    setCount(count+1);
  };

  // 編集を押したら登録データの編集
  const handleEditSubmit = (e: any) => {
    //リロードを行わないようにする処理。
    e.preventDefault();

    // 編集用データの格納
    data[indexNum].title = tmpTitle;
    data[indexNum].content = tmpContent;

    //一時変数の削除
    setTmpTitle("");
    setTmpContent("");

    //モーダルを閉じる
    setEditOpen(false);
  };

    // localStrage用のデータ格納
    useEffect(() => {
      localStorage.setItem("todoTask", JSON.stringify(data));
    }, [data]);

  return (
    <div className="App">
      <div className={classes.nav}>
        <Button className={classes.between} variant="outlined" color="secondary">Home</Button>
        <Button className={classes.between} variant="outlined" color="secondary">Sign in</Button>
        <Button className={classes.between} variant="outlined" color="secondary">Sign up</Button>
      </div>

      <hr />
      <div className="main-wrap">
        <div className="title-area">タスク管理用アプリ</div>
        <div className="create-task-area">
          <form onSubmit={handleAddSubmit}>
            {/* タスクのタイトル */}
            タイトル：<input
              type="text"
              required
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            /><br />
            {/* タスクの内容 */}
            タスクの内容：<input
              type="text"
              required
              onChange={(e) => setContent(e.target.value)}
              value={content}
            /><br />
            <Button type="submit" variant="outlined">タスク生成</Button>
          </form>
        </div>

        {data.map((item, index) => (
          <div key={index} className={classes.todoContent}>
            <Card sx={{ minWidth: 20 }}>
              <form onSubmit={handleAddSubmit}>
                <CardContent>
                  {/* タスクのタイトル */}
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    タイトル：<input
                      type="text"
                      required
                      onChange={(e) => setContent(e.target.value)}
                      value={(data.length === 0) ? "" : item.title}
                      className={classes.formStyle}
                    /><br />
                  </Typography>
                  <Typography variant="body2">
                    タスクの内容：<input
                      type="text"
                      required
                      onChange={(e) => setContent(e.target.value)}
                      value={(data.length === 0) ? "" : item.content}
                      className={classes.formStyle}
                    /><br />
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => clickEditButton(item.id)}>編集</Button>
                  <Button size="small" onClick={() => clickDeleteButton(item.id)}>削除</Button>
                </CardActions>
              </form>
            </Card>
            {/* 編集用モーダル */}
            <Modal
              open={editOpen}
              onClose={() => setEditOpen(false)}
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
                  <DialogTitle>メッセージ編集</DialogTitle>
                  <DialogContent>
                    <form onSubmit={handleEditSubmit}>
                      {/* タスクのタイトル */}
                      タイトル：<input
                        type="text"
                        required
                        onChange={(e) => setTmpTitle(e.target.value)}
                        defaultValue={(data.length === 0) ? "" : item.title}
                      /><br />
                      {/* タスクの内容 */}
                      タスクの内容：<input
                        type="text"
                        required
                        onChange={(e) => setTmpContent(e.target.value)}
                        defaultValue={(data.length === 0) ? "" : item.content}
                      /><br />
                      <Button type="submit">編集</Button>
                      <Button onClick={() => setEditOpen(false)}>戻る</Button>
                    </form>
                  </DialogContent>
                </Box>
              </Paper>
            </Modal>

            {/* 削除用モーダル */}
            <Modal
              open={deleteOpen}
              onClose={() => setDeleteOpen(false)}
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
                  <DialogTitle>本当に削除しますか？</DialogTitle>
                  <DialogContent>
                    <Button onClick={() => executeDelete()}>削除</Button>
                    <Button onClick={() => setDeleteOpen(false)}>戻る</Button>
                  </DialogContent>
                </Box>
              </Paper>
            </Modal>

          </div>
        ))}
      </div>


    </div>
  )
}

export default App
