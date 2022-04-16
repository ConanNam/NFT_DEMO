import 'regenerator-runtime/runtime'
import React, { useEffect, useState, useRef } from 'react'
import { login, logout } from './utils'
import './global.css'
import 'antd/dist/antd.css'
import getConfig from './config'
import Header from './components/header/Header'
import { Button } from 'antd'
import Market from './components/market/Market'
import Asset, { GAS } from './components/asset/Asset'
import * as nearAPI from 'near-api-js';
const { networkId } = getConfig(process.env.NODE_ENV || 'development')


export const {
  utils: {
      format: {
          formatNearAmount, parseNearAmount
      }
  }
} = nearAPI;

export default function App() {

  const [isMarket, setIsMarket] = useState(true)

  const [items, setItems] = useState([])
  const [marketItems, setMarketItems] = useState([])
  console.log("🚀 ~ file: App.js ~ line 29 ~ App ~ marketItems", marketItems)
  const [assetItems, setAssetItems] = useState([])
  console.log("🚀 ~ file: App.js ~ line 31 ~ App ~ assetItems", assetItems)
    useEffect(() => {
        loadItems()
    }, [isMarket])


    const loadItems = async () => {
        const num_tokens = await window.contract.get_num_tokens();
        console.log("🚀 ~ file: App.js ~ line 35 ~ loadItems ~ num_tokens", num_tokens)
        const newItems = [];
        for (let i = 1; i <= num_tokens; i++) {
            const data = await window.contract.get_token_data({
                token_id: i
            });
            newItems.push({
                ...data,
                token_id: i
            });
        }
        newItems.reverse();
        setItems(newItems);
        console.log('loaded items', newItems);
        const market = newItems.filter((item) => item.price != 0);
        const asset = newItems.filter((item) => item.owner_id == window.accountId);
        setAssetItems(asset)
        setMarketItems(market)
    };

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Welcome to NEAR!</h1>
        <p>
          To make use of the NEAR blockchain, you need to sign in. The button
          below will sign you in using NEAR Wallet.
        </p>
        <p>
          By default, when your app runs in "development" mode, it connects
          to a test network ("testnet") wallet. This works just like the main
          network ("mainnet") wallet, but the NEAR Tokens on testnet aren't
          convertible to other currencies – they're just for testing!
        </p>
        <p>
          Go ahead and click the button below to try it out:
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <Button onClick={login} type='primary'>Sign in</Button>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <Header setIsMarket={setIsMarket}/>
      {isMarket ? <Market market={marketItems}/> : 
      <Asset 
      assets={assetItems}
      loadItems={loadItems}/>}
    </>
  )
}