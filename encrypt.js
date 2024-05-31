import { LitNodeClient, encryptString } from "@lit-protocol/lit-node-client";
import { AuthCallbackParams } from "@lit-protocol/types"
import { LitAbility, LitAccessControlConditionResource, LitActionResource, createSiweMessageWithRecaps, generateAuthSig } from "@lit-protocol/auth-helpers";
import {ethers} from 'ethers';


const genWallet = () => {
  // known private key for testing
  // replace with your own key
  return new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', genProvider());
  }

const main = async () => {
  let client = new LitNodeClient({
      litNetwork: 'cayenne',
      debug: true
  });

  const wallet = genWallet();
  const chain = 'ethereum';
  // lit action will allow anyone to decrypt this api key with a valid authSig
  const accessControlConditions = [
    {
      contractAddress: '',
      standardContractType: '',
      chain,
      method: '',
      parameters: [
        ':userAddress',
      ],
      returnValueTest: {
        comparator: '=',
        value: '0x6Bd07000C5F746af69BEe7f151eb30285a6678B2'
      }
    }
  ]
  
  
const genAuthSig = async (
  wallet: ethers.Wallet,
  client: LitNodeClient,
  uri: string,
  resources: LitResourceAbilityRequest[]
) => {

  let blockHash = await client.getLatestBlockhash();
  const message = await createSiweMessageWithRecaps({
      walletAddress: wallet.address,
      nonce: blockHash,
      litNodeClient: client,
      resources,
      expiration: ONE_WEEK_FROM_NOW,
      uri
  })
  const authSig = await generateAuthSig({
      signer: wallet,
      toSign: message,
      address: wallet.address
  });


  return authSig;
}

const genSession = async (
  wallet: ethers.Wallet,
  client: LitNodeClient,
  resources: LitResourceAbilityRequest[]) => {
  let sessionSigs = await client.getSessionSigs({
      chain: "ethereum",
      resourceAbilityRequests: resources,
      authNeededCallback: async (params: AuthCallbackParams) => {
        console.log("resourceAbilityRequests:", params.resources);

        if (!params.expiration) {
          throw new Error("expiration is required");
        }

        if (!params.resources) {
          throw new Error("resourceAbilityRequests is required");
        }

        if (!params.uri) {
          throw new Error("uri is required");
        }

        // generate the authSig for the inner signature of the session
        // we need capabilities to assure that only one api key may be decrypted
        const authSig = genAuthSig(wallet, client, params.uri, params.resourceAbilityRequests ?? []);
        return authSig;
      }
  });

  return sessionSigs;
}

  await client.connect();
  /*
  Here we are encypting our key for secure use within an action
  this code should be run once and the ciphertext and dataToEncryptHash stored for later sending
  to the Lit Action in 'jsParams'
  */
  const { ciphertext, dataToEncryptHash } = await encryptString(
      {
          accessControlConditions,
          dataToEncrypt: key,
      },
      client
  );

  console.log("cipher text:", ciphertext, "hash:", dataToEncryptHash);
  const accsResourceString = 
      await LitAccessControlConditionResource.generateResourceString(accessControlConditions as any, dataToEncryptHash);
  const sessionForDecryption = await genSession(wallet, client, [
      {
          resource: new LitActionResource('*'),
          ability: LitAbility.LitActionExecution,
      },
      {
          resource: new LitAccessControlConditionResource(accsResourceString),
          ability: LitAbility.AccessControlConditionDecryption,

      }
  ]
  );
}