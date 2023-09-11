# ENUM
POST JSON
URI: enum/generate
{
    "enum_name": "BuffCellType",
    "enum_keys": ["ATTACK_SPEED", "DAMAGE", "ATTACK_RANGE", "INVALID"]
}

# FACTORY
POST JSON
URI: factory/generate
{
    "factory_name": "BuffCellFactory",
    "type_enum": "BuffCellType",
    "mapping": 
    {
        "ATTACK_SPEED": ["BuffCellAttackSpeedModel", "BuffCellAttackSpeedView"],
        "DAMAGE": ["BuffCellDamageModel", "BuffCellDamageView"],
        "ATTACK_RANGE": ["BuffCellAttackRangeModel", "BuffCellAttackRangeView"]
    }
}