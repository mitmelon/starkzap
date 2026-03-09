export declare const ABI: readonly [{
    readonly type: "interface";
    readonly name: "staking::staking::interface::IStaking";
    readonly items: readonly [{
        readonly type: "function";
        readonly name: "staker_pool_info";
        readonly inputs: readonly [{
            readonly name: "staker_address";
            readonly type: "core::starknet::contract_address::ContractAddress";
        }];
        readonly outputs: readonly [{
            readonly type: "staking::staking::interface::StakerPoolInfoV2";
        }];
        readonly state_mutability: "view";
    }, {
        readonly type: "function";
        readonly name: "get_active_tokens";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "core::array::Span::<core::starknet::contract_address::ContractAddress>";
        }];
        readonly state_mutability: "view";
    }, {
        readonly type: "function";
        readonly name: "get_total_stake";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "core::integer::u128";
        }];
        readonly state_mutability: "view";
    }, {
        readonly type: "function";
        readonly name: "get_total_stake_for_token";
        readonly inputs: readonly [{
            readonly name: "token_address";
            readonly type: "core::starknet::contract_address::ContractAddress";
        }];
        readonly outputs: readonly [{
            readonly type: "core::integer::u128";
        }];
        readonly state_mutability: "view";
    }, {
        readonly type: "function";
        readonly name: "contract_parameters_v1";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "staking::staking::interface::StakingContractInfoV1";
        }];
        readonly state_mutability: "view";
    }];
}, {
    readonly type: "struct";
    readonly name: "staking::staking::interface::StakingContractInfoV1";
    readonly members: readonly [{
        readonly name: "min_stake";
        readonly type: "core::integer::u128";
    }, {
        readonly name: "token_address";
        readonly type: "core::starknet::contract_address::ContractAddress";
    }, {
        readonly name: "attestation_contract";
        readonly type: "core::starknet::contract_address::ContractAddress";
    }, {
        readonly name: "pool_contract_class_hash";
        readonly type: "core::starknet::class_hash::ClassHash";
    }, {
        readonly name: "reward_supplier";
        readonly type: "core::starknet::contract_address::ContractAddress";
    }, {
        readonly name: "exit_wait_window";
        readonly type: "starkware_utils::types::time::time::TimeDelta";
    }];
}, {
    readonly type: "struct";
    readonly name: "starkware_utils::types::time::time::TimeDelta";
    readonly members: readonly [{
        readonly name: "seconds";
        readonly type: "core::integer::u64";
    }];
}, {
    readonly type: "struct";
    readonly name: "staking::staking::interface::StakerPoolInfoV2";
    readonly members: readonly [{
        readonly name: "commission";
        readonly type: "core::option::Option::<core::integer::u16>";
    }, {
        readonly name: "pools";
        readonly type: "core::array::Span::<staking::staking::interface::PoolInfo>";
    }];
}, {
    readonly type: "struct";
    readonly name: "staking::staking::interface::PoolInfo";
    readonly members: readonly [{
        readonly name: "pool_contract";
        readonly type: "core::starknet::contract_address::ContractAddress";
    }, {
        readonly name: "token_address";
        readonly type: "core::starknet::contract_address::ContractAddress";
    }, {
        readonly name: "amount";
        readonly type: "core::integer::u128";
    }];
}, {
    readonly type: "impl";
    readonly name: "StakingImpl";
    readonly interface_name: "staking::staking::interface::IStaking";
}, {
    readonly type: "enum";
    readonly name: "core::option::Option::<core::integer::u16>";
    readonly variants: readonly [{
        readonly name: "Some";
        readonly type: "core::integer::u16";
    }, {
        readonly name: "None";
        readonly type: "()";
    }];
}, {
    readonly type: "struct";
    readonly name: "core::array::Span::<staking::staking::interface::PoolInfo>";
    readonly members: readonly [{
        readonly name: "snapshot";
        readonly type: "@core::array::Array::<staking::staking::interface::PoolInfo>";
    }];
}, {
    readonly type: "struct";
    readonly name: "core::array::Span::<core::starknet::contract_address::ContractAddress>";
    readonly members: readonly [{
        readonly name: "snapshot";
        readonly type: "@core::array::Array::<core::starknet::contract_address::ContractAddress>";
    }];
}];
//# sourceMappingURL=staking.d.ts.map