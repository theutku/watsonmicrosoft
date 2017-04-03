export interface IJdashPlan {
    name: string,
    appLimit: string,
    userLimit: string,
    price: string
}

export const jdashPlans: [IJdashPlan] = [
    {
        name: 'starter',
        appLimit: '5',
        userLimit: '10',
        price: '9.99',
    },
    {
        name: 'advanced',
        appLimit: '10',
        userLimit: '15',
        price: '29.99'
    },
    {
        name: 'pro',
        appLimit: '100',
        userLimit: '100',
        price: '69.99'
    }
]

