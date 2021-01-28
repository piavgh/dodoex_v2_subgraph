import {BigInt, BigDecimal, ethereum, log, Address} from '@graphprotocol/graph-ts'
import {createUser, ZERO_BI, ZERO_BD, ONE_BI, convertTokenToDecimal, BI_18, createLpToken,createPool} from "./helpers"
import {Deposit, Withdraw, Claim} from "../types/DODOMine/DODOMine"
import {LiquidityPosition, LpToken} from "../types/schema"

export function handleDeposit(event: Deposit): void {
    let pool = createPool(event.params.pid);
    let lpToken = LpToken.load(pool.lpToken)
    let dealedAmount = convertTokenToDecimal(event.params.amount,lpToken.decimals);

    let liquidityPositionID = event.params.user.toHexString().concat("-").concat(event.address.toHexString());
    let liquidityPosition = LiquidityPosition.load(liquidityPositionID);
    if (liquidityPosition == null) {
        liquidityPosition = new LiquidityPosition(liquidityPositionID);
        liquidityPosition.pair = event.address.toHexString();
        liquidityPosition.user = event.params.user.toHexString();
        liquidityPosition.liquidityTokenBalance = ZERO_BD;
        liquidityPosition.lpToken = lpToken.id;
        liquidityPosition.lastTxTime = event.block.timestamp;
        liquidityPosition.liquidityTokenInMining = ZERO_BD;
    }
    liquidityPosition.liquidityTokenInMining = liquidityPosition.liquidityTokenInMining.plus(dealedAmount);
    liquidityPosition.save();
}

export function handleWithdraw(event: Withdraw): void {

    let pool = createPool(event.params.pid);
    let lpToken = LpToken.load(pool.lpToken)
    let dealedAmount = convertTokenToDecimal(event.params.amount,lpToken.decimals);

    let liquidityPositionID = event.params.user.toHexString().concat("-").concat(event.address.toHexString());
    let liquidityPosition = LiquidityPosition.load(liquidityPositionID);
    if (liquidityPosition == null) {
        liquidityPosition = new LiquidityPosition(liquidityPositionID);
        liquidityPosition.pair = event.address.toHexString();
        liquidityPosition.user = event.params.user.toHexString();
        liquidityPosition.liquidityTokenBalance = ZERO_BD;
        liquidityPosition.lpToken = lpToken.id;
        liquidityPosition.lastTxTime = event.block.timestamp;
        liquidityPosition.liquidityTokenInMining = ZERO_BD;
    }
    liquidityPosition.liquidityTokenInMining = liquidityPosition.liquidityTokenInMining.minus(dealedAmount);
    liquidityPosition.save();
}
