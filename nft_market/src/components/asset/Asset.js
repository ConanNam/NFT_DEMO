import React, { useEffect, useState } from 'react'
import {
  Input,
  Button,
  Card,
  InputNumber,
  message
} from 'antd';
import './asset.css'
import { async } from 'regenerator-runtime';
import { formatNearAmount, parseNearAmount } from 'near-api-js/lib/utils/format';
import { fetchFile, storedFile, type_file } from '../../utils/storedFile';

export const GAS = "300000000000000";
export const one_Yoctor = "0.000000000000000000000001"
const key = 'updatable';
const { Meta } = Card;

const Asset = ({ assets, loadItems }) => {

  const [file, setFile] = useState({})
  console.log("🚀 ~ file: Asset.js ~ line 22 ~ Asset ~ file", file)

  const accountId = window.accountId = window.walletConnection.getAccountId();
  console.log("🚀 ~ file: Asset.js ~ line 18 ~ Asset ~ accountId", accountId)
  const [price, setPrice] = useState('')



  const handleChooseFile = (e) => {
    setFile(e.target.files);
  }


  const handleMintToken = async () => {
    message.loading({ content: 'Loading...', key, duration:10 });
    const rootCid = await storedFile(file);
    const tokenId = await window.contract.mint_token({
      owner_id: accountId,
      metadata: rootCid,
      type_nft: file[0].type,
      name_nft: file[0].name
    }, GAS, parseNearAmount('1'))
    console.log("🚀 ~ file: Asset.js ~ line 27 ~ handleMintToken ~ tokenId", tokenId)
    await loadItems()
  }

  const handleSetPriceAsset = async (token_id, price) => {
    message.loading({ content: 'Loading...', key });
    await window.contract.set_price({
      token_id: token_id,
      amount: parseNearAmount(price)
    })

    setTimeout(() => {
      message.success({ content: 'Success!', key, duration: 2 });
    }, 1000);
  }


  return (
    <div>
      <Input.Group compact style={{
        margin: "0 auto",
        marginTop: 30,
        width: '60%'
      }}>
        <input type='file' name='file' onChange={handleChooseFile} />
        <Button type="primary"
          style={{margin:2}}
          onClick={handleMintToken}>Mint</Button>
      </Input.Group>
      <div className='container__asset'>
        {assets?.map((item, index) => {
          return (
            <Card

              key={index}
              hoverable
              style={{ width: 240, margin: 20, alignItems: 'center' }}
              cover={<img
                alt={`example_${index}`}
                src={type_file(item.type_nft)}
                height={260}
                onClick={() => fetchFile(item.metadata, true)}
              />}
            >
              <Meta title={item.name_nft} />
              <InputNumber defaultValue={formatNearAmount(item?.price) || 0}
                onChange={(e) => {
                  setPrice(e.toString())
                }} />
              <Button style={{ marginTop: 20, marginLeft: 5 }}
                onClick={() => {
                  handleSetPriceAsset(item.token_id, price)
                  setPrice('')
                }}
              >Set price</Button>
              <Button
                style={{ marginTop: 20, alignSelf: 'center' }}
                type='primary'
                onClick={() => fetchFile(item.metadata, false)}
              >Download</Button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default Asset