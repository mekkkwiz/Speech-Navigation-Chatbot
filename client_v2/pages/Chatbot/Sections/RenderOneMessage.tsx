import React from 'react'
import { List, Avatar } from 'antd';
import { RobotOutlined, SmileOutlined } from '@ant-design/icons'
import { Sarabun } from "@next/font/google";

const font = Sarabun({
  subsets: ["thai", "latin"],
  weight: "400",
});
type MyPros = {
    who: 'bot' | 'user',
    text: string
}

export default function RenderOneMessage(props: MyPros) {

    const AvatarSrc = (props.who ==='bot') ?
    <RobotOutlined style={{display: 'inline-block',verticalAlign: 'middle', fontSize: '20px', color: 'black'}}/>
    : <SmileOutlined style={{display: 'inline-block',verticalAlign: 'middle', fontSize: '20px', color: 'black'}}/>

    return(
        <List.Item style={{ padding: '1rem' }}>
            <List.Item.Meta
                avatar={<Avatar icon={AvatarSrc} />}
                title={props.who == 'bot' ? 'บอท' : 'คุณ'}
                description={props.text}
                style={{ fontFamily: font.style.fontFamily }}
            />
        </List.Item>
    )
}
