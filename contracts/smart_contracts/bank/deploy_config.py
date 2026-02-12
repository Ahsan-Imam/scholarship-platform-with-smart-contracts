import logging
import algokit_utils

logger = logging.getLogger(__name__)


def deploy() -> None:
    # Import the GENERATED client for your new contract
    from smart_contracts.artifacts.meal_canteen.meal_canteen_client import MealCanteenFactory

    # Create Algorand client from .env
    algorand = algokit_utils.AlgorandClient.from_environment()

    # DEPLOYER account must exist in environment
    deployer = algorand.account.from_environment("DEPLOYER")

    # Get typed factory
    factory = algorand.client.get_typed_app_factory(
        MealCanteenFactory,
        default_sender=deployer.address,
    )

    # ========== DEPLOY CONTRACT ==========
    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )

    # Log deployment
    if result.operation_performed in [
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ]:
        logger.info(
            f"Deployed MealCanteen app {app_client.app_id} "
            f"to address {app_client.app_address}"
        )

    # ========== POST DEPLOY SETUP ==========

    # Read from your .env
    meal_asa = int(algokit_utils.get_env("VITE_MEAL_ASA_ID", "0"))
    canteen = algokit_utils.get_env("VITE_CANTEEN_ADDRESS", "")

    # 1. Set ASA ID in contract
    if meal_asa > 0:
        logger.info(f"Setting MEAL ASA ID = {meal_asa}")
        app_client.set_meal_asa(asa_id=meal_asa)

    # 2. Register canteen as vendor
    if canteen:
        logger.info(f"Adding vendor {canteen}")
        app_client.add_vendor(vendor=canteen)

    logger.info("MEAL Canteen deployment & setup completed 🚀")
