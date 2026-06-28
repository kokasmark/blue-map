function getInt(data: DataView, offset: number, numBytes = 2): number {
    switch (numBytes) {
        case 1:
            return data.getUint8(offset);
        case 2:
            return data.getUint16(offset, true);
        case 4:
            return data.getUint32(offset, true);
        default:
            throw new Error("Unsupported integer size");
    }
}

function getSectionOffsets(data: DataView): number[] {
    let ofs = 0x14;
    const sectionOffsets = new Array(10).fill(0);
    const entryLens = [1, 4, 4, 1, 1, 1, 1, 4, 4, 1];

    for (let i = 0; i < entryLens.length; i++) {
        let count = 0;

        for (let j = 0; j < 3; j++) {
            count = getInt(data, ofs);
            ofs += 4;
        }

        sectionOffsets[i] = ofs;
        ofs += count * entryLens[i];
    }

    return sectionOffsets;
}

function getSecrets(data: DataView): number[] {
    const secrets: number[] = [];
    const offs = getSectionOffsets(data)[0];

    for (let i = 1; i < 638; i++) {
        secrets.push(getInt(data, offs + i, 1));
    }

    return secrets;
}

export async function loadSecrets(file: File): Promise<number[]> {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);
    return getSecrets(view);
}