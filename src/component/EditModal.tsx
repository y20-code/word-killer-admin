import React,{useEffect} from 'react';
import {Modal,Form,Input,Select} from 'antd';
import type {WordItem} from '../types'
import type { EditFilled } from '@ant-design/icons';

interface Props{
    isOpen:boolean;
    currentWord: WordItem | null;
    onClose: () => void;
    onUpdate: (id:string,values:any) => void;
}

const EditModal:React.FC<Props> = ({isOpen,currentWord,onClose,onUpdate}) =>{
    const [form] = Form.useForm();

    useEffect(() =>{
        if(currentWord) {
            form.setFieldsValue({
                en:currentWord.en,
                cn:currentWord.cn,
                level:currentWord.level
            });
        }
    },[currentWord,form]);

    const handleOk = () =>{
        form.validateFields().then(values =>{
            if (currentWord){
                onUpdate(currentWord.id,values);
                onClose();
            }
        }).catch(info => {
            console.log('校验失败',info);
        })
    }

    return (
        <Modal
            title="编辑单词"
            open={isOpen}
            onOk={handleOk}
            onCancel={onClose}
            forceRender
        >
            <Form form={form} layout='vertical'>
                <Form.Item name="en" label="英文" rules={[{required:true}]}>
                    <Input/>
                </Form.Item>
                <Form.Item name="cn" label="中文" rules={[{required:true}]}>
                    <Input/>
                </Form.Item>
                <Form.Item name="level" label="难度">
                    <Select
                        options={[
                            { label: '高考', value: '高考' },
                            { label: '四级', value: '四级' },
                            { label: '六级', value: '六级' },
                            { label: '雅思', value: '雅思' },
                        ]}
                    
                    />
                </Form.Item>
            </Form>

        </Modal>
    )
}

export default EditModal;