import LZString from "./lzstring";

const uncompressed = "12adcneicgepc9epcaeochehchokh3bf1nbch19qchehcheocaepcg19kcheocgepc9epcgeich19qchehch19rcg19rcgeoca19rcg19rcg19kco19kcg19rcgeocaepcg19rcgeicgeicheocheocaeochehcheocaeocheicgeocaepc9epcgeicheocheocaeochehcheoca19rcgeocheicgeicgepcgepc919rcheocaeochehcheoca19rcg19rcg19rcgeicheocgeichehcheochehcheocaepcgeocaepcgeicgepc9epcgeicheocg19kcheoch19qcaepcgeicgepcgeicgeicheocgeichehcheocheocaeocheicgeocaepcgeicgepcgeicgeicheocheocaeochehcheochehcheicgeocaepcgeicgepcaeocheocaeochehcheocaeocheicgeocheicgepcgeicgepc9epcgeicheocaeochehcheicgeoch19rcgeicg19rcgeicheocgeich19qch19qcheicg19rcgeicgepc9epcgeicheocgeicheocaeocheocaeocheicgeocaepcgeicgepcg19kcheochehch19qch19qca19rcg19rcg";
const uncompressedUnderscored = "12ad_cn_ei_cg_ep_c9_ep_ca_eo_ch_eh_ch_okh_3bf_1nb_ch_19q_ch_eh_ch_eo_ca_ep_cg_19k_ch_eo_cg_ep_c9_ep_cg_ei_ch_19q_ch_eh_ch_19r_cg_19r_cg_eo_ca_19r_cg_19r_cg_19k_co_19k_cg_19r_cg_eo_ca_ep_cg_19r_cg_ei_cg_ei_ch_eo_ch_eo_ca_eo_ch_eh_ch_eo_ca_eo_ch_ei_cg_eo_ca_ep_c9_ep_cg_ei_ch_eo_ch_eo_ca_eo_ch_eh_ch_eo_ca_19r_cg_eo_ch_ei_cg_ei_cg_ep_cg_ep_c9_19r_ch_eo_ca_eo_ch_eh_ch_eo_ca_19r_cg_19r_cg_19r_cg_ei_ch_eo_cg_ei_ch_eh_ch_eo_ch_eh_ch_eo_ca_ep_cg_eo_ca_ep_cg_ei_cg_ep_c9_ep_cg_ei_ch_eo_cg_19k_ch_eo_ch_19q_ca_ep_cg_ei_cg_ep_cg_ei_cg_ei_ch_eo_cg_ei_ch_eh_ch_eo_ch_eo_ca_eo_ch_ei_cg_eo_ca_ep_cg_ei_cg_ep_cg_ei_cg_ei_ch_eo_ch_eo_ca_eo_ch_eh_ch_eo_ch_eh_ch_ei_cg_eo_ca_ep_cg_ei_cg_ep_ca_eo_ch_eo_ca_eo_ch_eh_ch_eo_ca_eo_ch_ei_cg_eo_ch_ei_cg_ep_cg_ei_cg_ep_c9_ep_cg_ei_ch_eo_ca_eo_ch_eh_ch_ei_cg_eo_ch_19r_cg_ei_cg_19r_cg_ei_ch_eo_cg_ei_ch_19q_ch_19q_ch_ei_cg_19r_cg_ei_cg_ep_c9_ep_cg_ei_ch_eo_cg_ei_ch_eo_ca_eo_ch_eo_ca_eo_ch_ei_cg_eo_ca_ep_cg_ei_cg_ep_cg_19k_ch_eo_ch_eh_ch_19q_ch_19q_ca_19r_cg_19r_cg";

function createResultInfo(compressedValue: string | Uint8Array, uncompressedValue: string) {
    return {
        length: compressedValue.length,
        ratio: (compressedValue.length / uncompressedValue.length),
    };
}

function testCompression(uncompressed: string) {
    const compressed = LZString.compress(uncompressed);
    const compressedB64 = LZString.compressToBase64(uncompressed);
    const compressedUint8 = LZString.compressToUint8Array(uncompressed);
    const compressedUtf16 = LZString.compressToUTF16(uncompressed);
    const compressedUri = LZString.compressToEncodedURIComponent(uncompressed);

    const results = {
        uncompressed: createResultInfo(uncompressed, uncompressed),
        compressed: createResultInfo(compressed, uncompressed),
        compressedB64: createResultInfo(compressedB64, uncompressed),
        compressedUint8: createResultInfo(compressedUint8, uncompressed),
        compressedUtf16: createResultInfo(compressedUtf16, uncompressed),
        compressedUri: createResultInfo(compressedUri, uncompressed),
    };

    const sortedResults = Object.fromEntries(
        Object.entries(results)
            .sort(([, {ratio: ratioA}], [, {ratio: ratioB}]) => {
                return ratioA - ratioB;
            }),
    );

    console.log(JSON.stringify(sortedResults, null, 2));
}

testCompression(uncompressed);
// testCompression(uncompressedUnderscored);
