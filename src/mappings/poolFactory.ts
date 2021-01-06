import {BigInt, BigDecimal, ethereum, log, Address} from '@graphprotocol/graph-ts'
import {OrderHistory, Token, Pair, CrowdPooling} from "../types/schema"
import {OrderHistory as OrderHistoryV1} from "../types/DODOV1Proxy01/DODOV1Proxy01"
import {
    createToken,
    createLpToken,
    createUser,
    ZERO_BI,
    ZERO_BD,
    ONE_BI,
    convertTokenToDecimal,
    TYPE_DPP_POOL,
    TYPE_DVM_POOL,
    USDT_ADDRESS
} from "./helpers"
import {NewDPP} from "../types/DPPFactory/DPPFactory"
import {NewDVM} from "../types/DVMFactory/DVMFactory"
import {DVM, DVM__getPMMStateResultStateStruct} from "../types/DVMFactory/DVM"
import {DPP, DPP__getPMMStateResultStateStruct} from "../types/DPPFactory/DPP"
import {NewCP} from "../types/CrowdPoolingFactory/CrowdPoolingFactory"
import {DVM as DVMTemplate, DPP as DPPTemplate, CP as CPTemplate} from "../types/templates"
import {FeeRateModel} from "../types/templates/DVM/FeeRateModel"
import {CP} from "../types/CrowdPoolingFactory/CP";

export function handleNewDVM(event: NewDVM): void {
    //1、获取token schema信息
    let baseToken = createToken(event.params.baseToken);
    let quoteToken = createToken(event.params.quoteToken);
    let pair = Pair.load(event.params.dvm.toHexString());

    if (pair == null) {
        pair = new Pair(event.params.dvm.toHexString());
        pair.baseToken = event.params.baseToken.toHexString();
        pair.type = TYPE_DVM_POOL;

        pair.quoteToken = event.params.quoteToken.toHexString();
        pair.creator = event.params.creator;
        pair.createdAtTimestamp = event.block.timestamp;
        pair.createdAtBlockNumber = event.block.number;

        pair.baseLpToken = event.params.dvm.toHexString();
        pair.quoteLpToken = event.params.dvm.toHexString();
        createLpToken(event.params.dvm);

        pair.txCount = ZERO_BI;
        pair.volumeBaseToken = ZERO_BD;
        pair.volumeQuoteToken = ZERO_BD;
        pair.amountUSDC = ZERO_BD;
        pair.liquidityProviderCount = ZERO_BI;

        let dvm = DVM.bind(event.params.dvm);
        let pmmState = dvm.getPMMState();
        pair.i = pmmState.i;
        pair.k = pmmState.K;
        pair.baseReserve = convertTokenToDecimal(pmmState.B, baseToken.decimals);
        pair.quoteReserve = convertTokenToDecimal(pmmState.Q, quoteToken.decimals);

        let feeRateModelAddress = dvm._LP_FEE_RATE_MODEL_();
        let feeRateModel = FeeRateModel.bind(feeRateModelAddress);
        pair.lpFeeRate = convertTokenToDecimal(feeRateModel.getFeeRate(Address.fromString(USDT_ADDRESS)), BigInt.fromI32(18));

        pair.mtFeeRateModel = dvm._MT_FEE_RATE_MODEL_();
        pair.maintainer = dvm._MAINTAINER_();

        pair.save()
    }

    DVMTemplate.create(event.params.dvm);

}

export function handleNewDPP(event: NewDPP): void {
    //1、获取token schema信息
    let baseToken = createToken(event.params.baseToken);
    let quoteToken = createToken(event.params.quoteToken);

    let pair = Pair.load(event.params.dpp.toHexString());

    if (pair == null) {
        pair = new Pair(event.params.dpp.toHexString());
        pair.baseToken = event.params.baseToken.toHexString();
        pair.type = TYPE_DPP_POOL;

        pair.quoteToken = event.params.quoteToken.toHexString();
        pair.creator = event.params.creator;
        pair.createdAtTimestamp = event.block.timestamp;
        pair.createdAtBlockNumber = event.block.number;

        pair.txCount = ZERO_BI;
        pair.volumeBaseToken = ZERO_BD;
        pair.volumeQuoteToken = ZERO_BD;
        pair.amountUSDC = ZERO_BD;
        pair.liquidityProviderCount = ZERO_BI;

        let dvm = DPP.bind(event.params.dpp);
        let pmmState = dvm.getPMMState();
        pair.i = pmmState.i;
        pair.k = pmmState.K;
        pair.baseReserve = convertTokenToDecimal(pmmState.B, baseToken.decimals);
        pair.quoteReserve = convertTokenToDecimal(pmmState.Q, quoteToken.decimals);

        let feeRateModelAddress = dvm._LP_FEE_RATE_MODEL_();
        let feeRateModel = FeeRateModel.bind(feeRateModelAddress);
        pair.lpFeeRate = convertTokenToDecimal(feeRateModel.getFeeRate(Address.fromString(USDT_ADDRESS)), BigInt.fromI32(18));

        pair.mtFeeRateModel = dvm._MT_FEE_RATE_MODEL_();
        pair.maintainer = dvm._MAINTAINER_();

        pair.save()
    }

    DPPTemplate.create(event.params.dpp);

}

export function handleNewCP(event: NewCP): void {
    //1、检查token情况
    let baseToken = createToken(event.params.baseToken);
    let quoteToken = createToken(event.params.quoteToken);

    let crowdPooling = CrowdPooling.load(event.params.cp.toHexString());
    if (crowdPooling == null) {
        crowdPooling = new CrowdPooling(event.params.cp.toHexString());
        crowdPooling.creator = event.params.creator;
        let cp = CP.bind(event.params.cp);
        crowdPooling.creator = event.params.creator;
        crowdPooling.baseToken = event.params.baseToken.toHexString();
        crowdPooling.quoteToken = event.params.quoteToken.toHexString();
        crowdPooling.bidStartTime = cp._PHASE_BID_STARTTIME_();
        crowdPooling.bidEndTime = cp._PHASE_BID_ENDTIME_();
        crowdPooling.calmEndTime = cp._PHASE_CALM_ENDTIME_();
        crowdPooling.freezeDuration = cp._FREEZE_DURATION_();
        crowdPooling.vestingDuration = cp._VESTING_DURATION_();
        crowdPooling.i = cp._I_();
        crowdPooling.k = cp._K_();

        crowdPooling.totalBase = convertTokenToDecimal(cp._TOTAL_BASE_(),baseToken.decimals);
        crowdPooling.poolQuoteCap = convertTokenToDecimal(cp._POOL_QUOTE_CAP_(),quoteToken.decimals);
        crowdPooling.poolQuote = ZERO_BD;

        crowdPooling.save();
    }

    CPTemplate.create(event.params.cp);

}
