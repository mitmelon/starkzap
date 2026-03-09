export declare const ABI: readonly [{
    readonly type: "interface";
    readonly name: "staking::pool::interface::IPool";
    readonly items: readonly [{
        readonly type: "function";
        readonly name: "contract_parameters_v1";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "staking::pool::interface::PoolContractInfoV1";
        }];
        readonly state_mutability: "view";
    }, {
        readonly type: "function";
        readonly name: "get_pool_member_info_v1";
        readonly inputs: readonly [{
            readonly name: "pool_member";
            readonly type: "core::starknet::contract_address::ContractAddress";
        }];
        readonly outputs: readonly [{
            readonly type: "core::option::Option::<staking::pool::interface::PoolMemberInfoV1>";
        }];
        readonly state_mutability: "view";
    }, {
        readonly type: "function";
        readonly name: "enter_delegation_pool";
        readonly inputs: readonly [{
            readonly name: "reward_address";
            readonly type: "core::starknet::contract_address::ContractAddress";
        }, {
            readonly name: "amount";
            readonly type: "core::integer::u128";
        }];
        readonly outputs: readonly [];
        readonly state_mutability: "external";
    }, {
        readonly type: "function";
        readonly name: "add_to_delegation_pool";
        readonly inputs: readonly [{
            readonly name: "pool_member";
            readonly type: "core::starknet::contract_address::ContractAddress";
        }, {
            readonly name: "amount";
            readonly type: "core::integer::u128";
        }];
        readonly outputs: readonly [{
            readonly type: "core::integer::u128";
        }];
        readonly state_mutability: "external";
    }, {
        readonly type: "function";
        readonly name: "exit_delegation_pool_intent";
        readonly inputs: readonly [{
            readonly name: "amount";
            readonly type: "core::integer::u128";
        }];
        readonly outputs: readonly [];
        readonly state_mutability: "external";
    }, {
        readonly type: "function";
        readonly name: "exit_delegation_pool_action";
        readonly inputs: readonly [{
            readonly name: "pool_member";
            readonly type: "core::starknet::contract_address::ContractAddress";
        }];
        readonly outputs: readonly [{
            readonly type: "core::integer::u128";
        }];
        readonly state_mutability: "external";
    }, {
        readonly type: "function";
        readonly name: "claim_rewards";
        readonly inputs: readonly [{
            readonly name: "pool_member";
            readonly type: "core::starknet::contract_address::ContractAddress";
        }];
        readonly outputs: readonly [{
            readonly type: "core::integer::u128";
        }];
        readonly state_mutability: "external";
    }];
}, {
    readonly type: "struct";
    readonly name: "staking::pool::interface::PoolContractInfoV1";
    readonly members: readonly [{
        readonly name: "staker_address";
        readonly type: "core::starknet::contract_address::ContractAddress";
    }, {
        readonly name: "staker_removed";
        readonly type: "core::bool";
    }, {
        readonly name: "staking_contract";
        readonly type: "core::starknet::contract_address::ContractAddress";
    }, {
        readonly name: "token_address";
        readonly type: "core::starknet::contract_address::ContractAddress";
    }, {
        readonly name: "commission";
        readonly type: "core::integer::u16";
    }];
}, {
    readonly type: "enum";
    readonly name: "core::option::Option::<staking::pool::interface::PoolMemberInfoV1>";
    readonly variants: readonly [{
        readonly name: "Some";
        readonly type: "staking::pool::interface::PoolMemberInfoV1";
    }, {
        readonly name: "None";
        readonly type: "()";
    }];
}, {
    readonly type: "struct";
    readonly name: "staking::pool::interface::PoolMemberInfoV1";
    readonly members: readonly [{
        readonly name: "reward_address";
        readonly type: "core::starknet::contract_address::ContractAddress";
    }, {
        readonly name: "amount";
        readonly type: "core::integer::u128";
    }, {
        readonly name: "unclaimed_rewards";
        readonly type: "core::integer::u128";
    }, {
        readonly name: "commission";
        readonly type: "core::integer::u16";
    }, {
        readonly name: "unpool_amount";
        readonly type: "core::integer::u128";
    }, {
        readonly name: "unpool_time";
        readonly type: "core::option::Option::<starkware_utils::types::time::time::Timestamp>";
    }];
}, {
    readonly type: "enum";
    readonly name: "core::option::Option::<starkware_utils::types::time::time::Timestamp>";
    readonly variants: readonly [{
        readonly name: "Some";
        readonly type: "starkware_utils::types::time::time::Timestamp";
    }, {
        readonly name: "None";
        readonly type: "()";
    }];
}, {
    readonly type: "struct";
    readonly name: "starkware_utils::types::time::time::Timestamp";
    readonly members: readonly [{
        readonly name: "seconds";
        readonly type: "core::integer::u64";
    }];
}];
//# sourceMappingURL=pool.d.ts.map