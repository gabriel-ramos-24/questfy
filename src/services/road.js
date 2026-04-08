import { getRoad, createRoad } from '../db/keyvalue';

const roadPadrao = {
    exatas: '2020_150',
    natureza: '2020_100',
    humanas: '2020_50',
    linguagens: '2020_10',
    erradas: [],
    favoritas: []
}

export async function getRoadData(env, email) {
    try {
        const result = await getRoad(env, email);

        if (!result) {
            return await createRoadData(env, email);
        }

        return {
            body: {
                ok: true,
                data: result
            },
            status: 200
        };

    } catch (error) {
        console.log(error);
        return {
            body: { ok: false, mensagem: "Erro interno ao buscar Trilha" },
            status: 500
        };
    }
}

async function createRoadData(env, email) {
    try {
        const created = await createRoad(env, email, roadPadrao);

        if (!created) {
            throw new Error("Erro ao criar trilha no banco de dados.");
        }

        return {
            body: {
                ok: true,
                data: roadPadrao
            },
            status: 200
        };

    } catch (error) {
        console.log(error);
        return {
            body: { ok: false, mensagem: "Erro interno ao criar Trilha Padrão" },
            status: 500
        };
    }
}