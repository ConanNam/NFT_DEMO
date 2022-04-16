import React, { useEffect, useState } from 'react'

import { Button, InputNumber, Card } from 'antd';
import './market.module.css'
import { formatNearAmount } from 'near-api-js/lib/utils/format';
import { GAS } from '../asset/Asset';
import { type_file } from '../../utils/storedFile';

const { Meta } = Card;


const Market = ({ market }) => {

    const handlePurchase = async (item) => {
        await window.contract.purchase({
            new_owner_id: window.accountId,
            token_id: item.token_id
        },
            GAS,
            item.price)
    }

    return (
        <div className='container__market'>
            {market?.map((item, index) => {
                return (
                    <Card
                        key={index}
                        hoverable
                        style={{ width: 240, margin: 20, alignItems: 'center'}}
                        cover={<img 
                            alt={`example_${index}`} 
                            src={type_file(item.type_nft)} 
                            height={260} />}
                    >
                        <Meta title={item.name_nft} description={item.owner_id}/>
                        <InputNumber defaultValue={formatNearAmount(item?.price)} />
                        <Button
                            disabled={item.owner_id == window.accountId}
                            style={{ marginTop: 20 }}
                            onClick={() => {
                                handlePurchase(item)
                            }}
                        >Purchase</Button>
                    </Card>
                )
            })}
        </div>
    )
}

export default Market