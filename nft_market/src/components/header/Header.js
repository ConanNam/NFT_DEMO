import React from 'react'
import { Avatar, Button, Image, Menu, Modal, Alert, Spin, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { logout } from '../../utils';
import './header.css'
import Big from 'big-js';

import { useEffect, useState } from 'react';
import { async } from 'regenerator-runtime';
import { formatNearAmount, parseNearAmount } from 'near-api-js/lib/utils/format';
import { GAS, one_Yoctor } from '../asset/Asset';

const Header = ({ setIsMarket }) => {

    const [balance, setBalance] = useState({})
    const [saleProceeds, setSaleProceeds] = useState('')
    const [isShowModal, setIsShowModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleShowModal = async () => {
        const blan = await window.account.getAccountBalance()
        const proceeds = await window.contract.get_proceeds({
            owner_id: window.accountId
        })
        setSaleProceeds(formatNearAmount(proceeds))
        setBalance(blan)
        setIsShowModal(!isShowModal)
    }

    const handleWithdraw = async () => {
        try {
            setLoading(true)
            await window.contract.withdraw({
                account_id: window.accountId
            },GAS,parseNearAmount(one_Yoctor))
            setLoading(false)
        } catch (error) {
            <Alert message={error} type="error" />
            setLoading(false)
            console.log("🚀 ~ file: Header.js ~ line 38 ~ handleWithdraw ~ error", error)
        }
    }

    return (
        <div className='container'>
            <div>
                <img src={require('../../assets/favicon.ico')} style={{ width: 40, height: 40, borderRadius: 25 }} />
            </div>
            <div className='container__user'>
                <Menu mode="horizontal"
                    defaultSelectedKeys={['1']}
                    style={{ marginRight: 36 }}>
                    <Menu.Item key={1} onClick={() => setIsMarket(true)}>Market</Menu.Item>
                    <Menu.Item key={2} onClick={() => setIsMarket(false)}>Assets</Menu.Item>
                </Menu>

                <div className='container__user'>
                    <div
                        onClick={handleShowModal}>
                        <Avatar size={36}
                            style={{ color: '#f56a00', backgroundColor: '#fde3cf', justifyContent: 'center' }}><UserOutlined /></Avatar>
                    </div>
                    <Button type='text'
                        danger size='large'
                        onClick={logout}
                    >
                        Sign out
                    </Button>
                </div>

            </div>
            <Modal title={window.accountId} visible={isShowModal} onOk={handleShowModal} onCancel={handleShowModal}>
                <p>{`Blance: ${formatNearAmount(balance.total)} N`}</p>
                <p>{`Sale proceeds: ${saleProceeds} N`}</p>
                <p><Button
                    type='primary'
                    disabled={saleProceeds == 0 ? true : false}
                    onClick={() => handleWithdraw()}>
                    Withdraw
                </Button>
                </p>
                {loading && <Space size="middle">
                    <Spin size="small" />
                    <Spin />
                    <Spin size="large" />
                </Space>}
            </Modal>
        </div>
    )
}

export default Header