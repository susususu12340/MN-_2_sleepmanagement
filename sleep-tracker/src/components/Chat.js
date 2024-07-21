import React, { useState } from "react";
import "../App.css";

//const API_BASE_URL = 'http://172.16.15.35:8000';
const API_BASE_URL = 'http://localhost:8000';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      setMessages([...messages, { user: "あなた", text: message }]);
      setMessage("");
    }
  };

  return (
    <div className="App">
      <h3 id="me" user_id="1">あなたはユーザー1です</h3>
      <h3 id="partner">相手</h3>
      <div id="users">
        <button className="user" user_id="2">ユーザー2</button>
      </div>
      <br />
      <div id="your_container">
        <div id="bms_messages_container">
          <div id="bms_chat_header">
            <div id="bms_chat_user_status">
              <div id="bms_status_icon">●</div>
              <div id="bms_chat_user_name">ユーザー</div>
            </div>
          </div>
          <div id="bms_messages">
            {messages.map((msg, index) => (
              <div key={index} className="bms_message bms_right">
                <div className="bms_message_box">
                  <div className="bms_message_content">
                    <div className="bms_message_text">
                      <strong>{msg.user}:</strong> {msg.text}
                    </div>
                  </div>
                </div>
                <div className="bms_clear"></div>
              </div>
            ))}
          </div>
          <div id="bms_send">
            <textarea
              id="bms_send_message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <div id="bms_send_btn" onClick={handleSendMessage}>
              送信
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
