import logging
from sqlalchemy.orm import Session
from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models.user import User, UserRole
from app.models.driver import Driver
from app.models.ambulance import Ambulance, AmbulanceType, VerificationStatus, Availability
from app.models.location import Location
from app.models.emergency import EmergencyRequest, EmergencyStatus, CallRecord
from app.auth.jwt_handler import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

def seed_database(db: Session = None):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    close_after = False
    if db is None:
        db = SessionLocal()
        close_after = True

    try:
        # Check if already seeded
        admin_exists = db.query(User).filter(User.email == "admin@ambulance.org").first()
        if admin_exists:
            logger.info("Database already contains seed data. Skipping.")
            return

        logger.info("Seeding database with default users, drivers, ambulances, and locations...")

        # 1. Admin User
        admin = User(
            email="admin@ambulance.org",
            hashed_password=get_password_hash("AdminPassword123"),
            full_name="Dr. Eleanor Vance (System Director)",
            phone="+919800000001",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)

        # 2. Regular Emergency User
        user = User(
            email="patient@ambulance.org",
            hashed_password=get_password_hash("UserPassword123"),
            full_name="Aarav Patel",
            phone="+919800000002",
            role=UserRole.USER,
            is_active=True
        )
        db.add(user)
        db.flush()

        # 3. Fleet of Ambulances & Drivers in City Grid (Center: 12.9716, 77.5946)
        fleet_data = [
            {
                "email": "driver.rajesh@ambulance.org",
                "name": "Rajesh Kumar",
                "phone": "+919876543210",
                "license": "DL-KA-2015-88392",
                "exp": 8,
                "photo": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&q=80",
                "vehicle": "KA-01-EA-1001",
                "type": AmbulanceType.ICU,
                "equipment": "Ventilator, Defibrillator, ECG Monitor, Advanced Suction, Oxygen Reserves",
                "is_online": True,
                "lat": 12.9752,
                "lon": 77.5925,
                "address": "Brigade Road Intersection"
            },
            {
                "email": "driver.suresh@ambulance.org",
                "name": "Suresh Menon",
                "phone": "+919876543211",
                "license": "DL-KA-2017-10492",
                "exp": 6,
                "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
                "vehicle": "KA-01-EA-1002",
                "type": AmbulanceType.ADVANCED,
                "equipment": "Defibrillator, Multi-parameter Monitor, Trauma Immobilization Kit, Infusion Pump",
                "is_online": True,
                "lat": 12.9685,
                "lon": 77.6012,
                "address": "Richmond Circle Station"
            },
            {
                "email": "driver.priya@ambulance.org",
                "name": "Priya Sharma",
                "phone": "+919876543212",
                "license": "DL-KA-2019-55021",
                "exp": 5,
                "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
                "vehicle": "KA-01-EA-1003",
                "type": AmbulanceType.BASIC,
                "equipment": "Stretcher, Basic First Aid, Oxygen Cylinder, BP Apparatus, Resuscitator",
                "is_online": True,
                "lat": 12.9840,
                "lon": 77.5860,
                "address": "Cunningham Road Standby"
            },
            {
                "email": "driver.ali@ambulance.org",
                "name": "Mohammed Ali",
                "phone": "+919876543213",
                "license": "DL-KA-2016-99201",
                "exp": 9,
                "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
                "vehicle": "KA-01-EA-1004",
                "type": AmbulanceType.PATIENT_TRANSPORT,
                "equipment": "Wheelchair Ramp, Foldable Stretcher, First Aid Kit",
                "is_online": True,
                "lat": 12.9560,
                "lon": 77.6140,
                "address": "Koramangala 1st Block"
            },
            {
                "email": "driver.vikram@ambulance.org",
                "name": "Vikram Rathore",
                "phone": "+919876543214",
                "license": "DL-KA-2018-77112",
                "exp": 4,
                "photo": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80",
                "vehicle": "KA-01-EA-1005",
                "type": AmbulanceType.ICU,
                "equipment": "Ventilator, Defibrillator, Syringe Pump",
                "is_online": False,  # OFFLINE for availability testing
                "lat": 12.9700,
                "lon": 77.5900,
                "address": "Malleshwaram Hub (Off-Duty)"
            }
        ]

        for item in fleet_data:
            d_user = User(
                email=item["email"],
                hashed_password=get_password_hash("DriverPassword123"),
                full_name=item["name"],
                phone=item["phone"],
                role=UserRole.DRIVER,
                is_active=True
            )
            db.add(d_user)
            db.flush()

            d_profile = Driver(
                user_id=d_user.id,
                license_number=item["license"],
                experience_years=item["exp"],
                photo_url=item["photo"],
                is_verified=True
            )
            db.add(d_profile)
            db.flush()

            amb = Ambulance(
                driver_id=d_profile.id,
                vehicle_number=item["vehicle"],
                ambulance_type=item["type"],
                equipment_details=item["equipment"],
                verification_status=VerificationStatus.APPROVED
            )
            db.add(amb)
            db.flush()

            avail = Availability(
                ambulance_id=amb.id,
                is_online=item["is_online"]
            )
            db.add(avail)

            loc = Location(
                ambulance_id=amb.id,
                latitude=item["lat"],
                longitude=item["lon"],
                address=item["address"]
            )
            db.add(loc)

        # 4. Sample Emergency Request & Call Record
        sample_req = EmergencyRequest(
            user_id=user.id,
            patient_name="Anita Sen",
            patient_phone="+919811223344",
            emergency_type="CARDIAC",
            latitude=12.9716,
            longitude=77.5946,
            address="MG Road Metro Exit 2",
            notes="Severe chest pain and shortness of breath",
            status=EmergencyStatus.COMPLETED
        )
        db.add(sample_req)
        db.flush()

        call = CallRecord(
            emergency_request_id=sample_req.id,
            user_id=user.id,
            ambulance_id=1,
            driver_phone="+919876543210",
            status="COMPLETED"
        )
        db.add(call)

        db.commit()
        logger.info("Database seeding successfully completed!")

    except Exception as e:
        db.rollback()
        logger.error(f"Error during seeding: {e}")
        raise
    finally:
        if close_after:
            db.close()

if __name__ == "__main__":
    seed_database()
