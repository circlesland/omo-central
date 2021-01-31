import jsonwebtoken from 'jsonwebtoken';
import * as base58 from 'base58-universal/main.js'

export declare enum CryptoSystem {
    ECC = "ecc",
    RSA = "rsa"
}
const ECC_DID_PREFIX: ArrayBuffer = new Uint8Array([ 0xed, 0x01 ]).buffer
const RSA_DID_PREFIX: ArrayBuffer = new Uint8Array([ 0x00, 0xf5, 0x02 ]).buffer
const BASE58_DID_PREFIX: string = 'did:key:z'

import {
    encode as _encode,
    decode as _decode
} from './baseN.js';

const base58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const base58 = {
    encode:function(input, maxline)
    {
        return _encode(input, base58Alphabet, maxline);
    },
    decode: function (input)
    {
        return _decode(input, base58Alphabet);
    }
}


export const arrBuffEqual = (aBuf: ArrayBuffer, bBuf: ArrayBuffer): boolean => {
    const a = new Uint8Array(aBuf)
    const b = new Uint8Array(bBuf)
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false
    }
    return true
}

const hasPrefix = (prefixedKey: ArrayBuffer, prefix: ArrayBuffer): boolean => {
    return arrBuffEqual(prefix, prefixedKey.slice(0, prefix.byteLength))
}
const parseMagicBytes = (prefixedKey: ArrayBuffer): {
    keyBuffer: ArrayBuffer
    type: CryptoSystem
} => {
    // RSA
    if (hasPrefix(prefixedKey, RSA_DID_PREFIX)) {
        return {
            keyBuffer: prefixedKey.slice(RSA_DID_PREFIX.byteLength),
            type: CryptoSystem.RSA
        }

        // ECC
    } else if (hasPrefix(prefixedKey, ECC_DID_PREFIX)) {
        return {
            keyBuffer: prefixedKey.slice(ECC_DID_PREFIX.byteLength),
            type: CryptoSystem.ECC
        }

    }

    throw new Error("Unsupported key algorithm. Try using RSA.")
}
function arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}
export function didToPublicKey(did: string): {
    publicKey: string,
    type: CryptoSystem
} {
    if (!did.startsWith(BASE58_DID_PREFIX)) {
        throw new Error("Please use a base58-encoded DID formatted `did:key:z...`")
    }

    const didWithoutPrefix = did.substr(BASE58_DID_PREFIX.length)
    const magicalBuf = base58.decode(didWithoutPrefix).buffer as ArrayBuffer
    const { keyBuffer, type } = parseMagicBytes(magicalBuf)

    return {
        publicKey: arrayBufferToBase64(keyBuffer),
        type
    }
}
/**
 * checks if a UCAN is valid and if so returns it's payload
 * @param myDid The 'ucan' must address my DID as audience
 * @param ucan
 * @param potency The allowed actions that the jwt can utilize and still be valid
 */
export function validateUcan(myDid:string, ucan: string, potency: string = null)
{
    const tokenPayload: any = jsonwebtoken.decode(ucan);

    // Check who issued the token
    if (typeof tokenPayload !== "object")
        throw new Error("Couldn't decode the jwt");

    const iss = tokenPayload.iss;
    if (!iss)
        throw new Error("No issuer (iss) claim.");

    const exp = tokenPayload.exp;
    if (!exp)
        throw new Error("No expiry (exp) claim.");

    const rsc:string = tokenPayload.rsc;
    if (!rsc)
        throw new Error("No ressource (rsc) claim.");

    if (!rsc.endsWith(".fission.name"))
        throw new Error("The ressource claim must contain the fission username in the form '[username].fission.name'")

    const ptc = tokenPayload.ptc;
    if (!ptc)
        throw new Error("No potency (ptc) claim.");

    const aud = tokenPayload.aud;
    if (typeof aud !== "object")
        throw new Error("The audience (aud) must be an array.");

    const audience = aud[0];
    if (audience != myDid)
        throw new Error("The received token doesn't address my DID (aud: " + audience + "; my DID: " + myDid + ")");

    const pubKey = didToPublicKey(iss);

    const verifiedPayload = jsonwebtoken.verify(ucan, pubKey);
    if (!verifiedPayload)
        throw new Error("The received jwt couldn't be verified.")

    return tokenPayload;
}
