use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen, setup_alloc, AccountId, Balance, Promise};
use near_sdk::collections::UnorderedMap;
use near_sdk::json_types::U128;
use serde::{Serialize, Deserialize};

setup_alloc!();

const MINT_FEE:u128 = 1_000_000_000_000_000_000_000_000;

pub type TokenId = u64;

#[derive(Debug, Serialize, Deserialize ,BorshDeserialize, BorshSerialize)]
pub struct TokenData {
    pub owner_id:AccountId,
    pub metadata:String,
    pub price:U128,
    pub type_nft:String,
    pub name_nft:String,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct NFTContract {
   pub token_to_data: UnorderedMap<TokenId,TokenData>,
   pub account_to_proceeds: UnorderedMap<AccountId, Balance>,
   pub token_id:TokenId
}

impl Default for NFTContract {
    fn default() -> Self {
        Self {
            token_to_data:UnorderedMap::new(b"ttd".to_vec()),
            account_to_proceeds: UnorderedMap::new(b"atp".to_vec()),
            token_id:0
        }
    }
}

#[near_bindgen]
impl NFTContract {
    
    pub fn nft_transfer(
        &mut self,
        receiver_id:AccountId,
        token_id:TokenId
    ) {
        let mut token_data = self.get_token_data(token_id.clone());
        self.only_owner(token_data.owner_id);
        token_data.owner_id = receiver_id;
        self.token_to_data.insert(&token_id, &token_data);
    }

    pub fn set_price(&mut self, token_id:TokenId, amount:U128) {
        let mut token_data = self.get_token_data(token_id.clone());
        self.only_owner(token_data.owner_id.clone());
        token_data.price = amount.into();
        self.token_to_data.insert(&token_id, &token_data);
    }

    // purchase and withdraw

    #[payable]
    pub fn purchase(&mut self, new_owner_id:AccountId, token_id:TokenId) {
        let mut token_data = self.get_token_data(token_id.clone());
        let price = token_data.price.into();
        assert!(price > 0, "not for sale");
        let deposit = env::attached_deposit();
        assert!(deposit == price, "deposit != price");

        let mut balance = self.account_to_proceeds.get(&token_data.owner_id).unwrap_or(0);
        balance += deposit;
        self.account_to_proceeds.insert(&token_data.owner_id, &balance);

        token_data.owner_id = new_owner_id;
        token_data.price = U128(0);
        self.token_to_data.insert(&token_id, &token_data);
    }

    #[payable]
    pub fn withdraw(&mut self, account_id:AccountId) {
        self.only_owner(account_id.clone());
        let proceeds = self.account_to_proceeds.get(&account_id).unwrap_or(0);
        assert!(proceeds > 0, "Nothing to withdraw");
        self.account_to_proceeds.insert(&account_id, &0);
        Promise::new(account_id).transfer(proceeds);
    }


    fn mint(&mut self, 
        owner_id:AccountId, 
        metadata:String, 
        type_nft:String,
        name_nft:String) {
        let token_id:u64 = self.token_id;
        let token_id_addition = token_id+1;
        
        self.token_id = token_id_addition;
        let token_data = TokenData {
            owner_id:owner_id.clone(),
            price: U128(0),
            metadata:metadata.clone(),
            type_nft:type_nft.clone(),
            name_nft:name_nft.clone()
        };

        self.token_to_data.insert(&token_id_addition, &token_data);
    }


    #[payable]
    pub fn mint_token(&mut self, 
        owner_id:AccountId, 
        metadata:String, 
        type_nft:String,
        name_nft:String) -> TokenId {
        let deposit = env::attached_deposit();
        assert!(deposit == MINT_FEE, "mint fee error!");
        self.mint(owner_id, metadata,type_nft, name_nft);
        self.token_id
    }





    //modifier

    fn only_owner(&self, account_id:AccountId) {
        let signer = env::signer_account_id();
        assert!(signer == account_id, "Not Allowed!");
    }



    /// view method
    
    pub fn get_token_data(&self, token_id:TokenId) -> TokenData {
        match self.token_to_data.get(&token_id) {
            Some(token_data) => {
                token_data
            },
            None => env::panic(b"No token exists")
        }
    }

    pub fn get_num_tokens(&self) -> u64 {
        self.token_id.clone()
    }

    pub fn get_proceeds(&self, owner_id:AccountId) -> U128 {
        self.account_to_proceeds.get(&owner_id).unwrap_or(0).into()
    }


}


// #[cfg(test)]

// mod tests {
//     use  super::*;
//     use near_sdk::MockedBlockchain;
//     use near_sdk::{testing_env, VMContext};

//     fn alice() -> AccountId {
//         "alice.testnet".to_string()
//     }
//     fn bob() -> AccountId {
//         "bob.testnet".to_string()
//     }
//     fn carol() -> AccountId {
//         "carol.testnet".to_string()
//     }
//     fn metadata() -> String {
//         "blah".to_string()
//     }


//     fn get_context(predecessor_account_id: String, storage_usage: u64) -> VMContext {
//         VMContext {
//             current_account_id: alice(),
//             signer_account_id: bob(),
//             signer_account_pk: vec![0, 1, 2],
//             predecessor_account_id,
//             input: vec![],
//             block_index: 0,
//             block_timestamp: 0,
//             account_balance: 0,
//             account_locked_balance: 0,
//             storage_usage,
//             attached_deposit: 0,
//             prepaid_gas: 10u64.pow(18),
//             random_seed: vec![0, 1, 2],
//             is_view: false,
//             output_data_receivers: vec![],
//             epoch_height: 19,
//         }
//     }

//     #[test]
//     fn mint_token_get_token_owner(){
//         let mut context = get_context(bob(), 0);
//         context.attached_deposit = MINT_FEE.into();
//         testing_env!(context);
//         let mut contract = NFTContract::new(bob());
//         let token_id = contract.mint_token(carol(), metadata());
//         match contract.get_token_data(token_id.clone()) {
//             token_data => {
//                 assert_eq!(carol(), token_data.owner_id, "Unexpected token owner.");
//             }
//         } 
       
//     }

//     #[test]
//     fn transfer_with_your_own_token() {
//         // Owner account: bob.testnet
//         // New owner account: alice.testnet

//         let mut context = get_context(bob(), 0);
//         context.attached_deposit = MINT_FEE.into();
//         testing_env!(context);
//         let mut contract = NFTContract::new(bob());
//         let token_id = contract.mint_token(bob(), metadata());

//         // pub fn nft_transfer(
//         //     &mut self,
//         //     receiver_id: AccountId,
//         //     enforce_owner_id: Option<AccountId>,
//         //     token_id: TokenId,
//         // ) {
//         // bob transfers the token to alice
//         contract.nft_transfer(alice(),token_id.clone());

//         // Check new owner
//         let token_data = contract.get_token_data(token_id.clone());
//         assert_eq!(alice(), token_data.owner_id, "Unexpected token owner.");
//     }

//     #[test]
//     fn mint_purchase_withdraw() {
//         let mut context = get_context(bob(), 0);
//         context.attached_deposit = MINT_FEE.into();
//         testing_env!(context.clone());
//         let mut contract = NFTContract::new(bob());
//         let token_id = contract.mint_token(carol(), metadata());
//         let token_data = contract.get_token_data(token_id.clone());
//         assert_eq!(carol(), token_data.owner_id, "Unexpected token owner.");

//         context.signer_account_id = carol();
//         testing_env!(context.clone());
//         contract.set_price(token_id.clone(), MINT_FEE.into());
//         context.signer_account_id = alice();
//         context.attached_deposit = MINT_FEE.into();
//         testing_env!(context.clone());
//         contract.purchase(alice(), token_id.clone());

//         let token_data = contract.get_token_data(token_id.clone());
//         assert_eq!(alice(), token_data.owner_id, "Unexpected token owner.");
//     }



// }