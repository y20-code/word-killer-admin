import React from 'react';
import {v4 as uuid} from 'uuid';
import {Form,Button,message,Input,Select} from 'antd';
import {type WordItem } from '../types';

interface Props{
    onAdd:(item:WordItem) => void;
}

const WordFrom:React.FC<Props> = ({onAdd})=> {

    const [form] = Form.useForm();

    const onFinish = (value:WordItem) =>{
        const item:WordItem = {
            id:uuid(),
            en:value.en,
            cn:value.cn,
            level:value.level,
            status:'未背',
            addedDate:new Date().toLocaleDateString(),
        }

        onAdd(item);

        form.resetFields();

        message.success('添加成功');
    }

    return (
        <Form
            form={form}
            onFinish={onFinish}
            layout='inline'
            initialValues={{level:'高考'}}
        >
            <Form.Item 
                name='en' label="英文" 
                rules={[{ required: true, message: '请输入英文！' }]}>
                <Input placeholder="英文单词" style={{ width: 150 }}></Input>
            </Form.Item>
            <Form.Item name='cn' label="中文" >
                <Input></Input>
            </Form.Item>
            <Form.Item name="level">
                <Select
                    style={{width:"100px"}}
                    options={[
                            { label: '高考', value: '高考' },
                            { label: '四级', value: '四级' },
                            { label: '六级', value: '六级' },
                            { label: '雅思', value: '雅思' },
                        ]}
                />
            </Form.Item>
            <Form.Item>
                <Button type='primary' htmlType='submit'>添加</Button>
            </Form.Item>

        </Form>
    )
}

export default WordFrom;