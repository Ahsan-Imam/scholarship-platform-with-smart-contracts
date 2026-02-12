from algopy import *
from algopy.arc4 import abimethod


class IdentityTokens(ARC4Contract):
    """
    ASA Management Contract for Student ID and Club Member tokens.
    These are non-transferable identity tokens used for access control.
    """

    # ASA IDs
    student_id_asa: UInt64
    club_member_asa: UInt64

    # Admin address for revocation
    admin: Account

    def __init__(self) -> None:
        self.student_id_asa = UInt64(0)
        self.club_member_asa = UInt64(0)
        self.admin = Global.creator_address

    # ==============================
    # ADMIN: CONFIGURE ASAs
    # ==============================

    @abimethod()
    def set_student_id_asa(self, asa_id: UInt64) -> None:
        """Set the Student ID Token ASA ID"""
        assert Txn.sender == self.admin, "Only admin"
        self.student_id_asa = asa_id

    @abimethod()
    def set_club_member_asa(self, asa_id: UInt64) -> None:
        """Set the Club Member Token ASA ID"""
        assert Txn.sender == self.admin, "Only admin"
        self.club_member_asa = asa_id

    # ==============================
    # ADMIN: ISSUE TOKENS
    # ==============================

    @abimethod()
    def issue_student_id(self, student: Account) -> None:
        """
        Admin issues Student ID Token to a student.
        Non-transferable. Admin can revoke.
        """
        assert Txn.sender == self.admin, "Only admin"
        assert self.student_id_asa > 0, "Student ID ASA not configured"

        # Send token to student (amount 1, frozen)
        itxn.AssetTransfer(
            xfer_asset=self.student_id_asa,
            asset_receiver=student,
            amount=UInt64(1),
            fee=0
        ).submit()

    @abimethod()
    def issue_club_member(self, member: Account) -> None:
        """
        Admin issues Club Member Token to a voter.
        Non-transferable. Admin can revoke.
        """
        assert Txn.sender == self.admin, "Only admin"
        assert self.club_member_asa > 0, "Club Member ASA not configured"

        # Send token to member (amount 1, frozen)
        itxn.AssetTransfer(
            xfer_asset=self.club_member_asa,
            asset_receiver=member,
            amount=UInt64(1),
            fee=0
        ).submit()

    # ==============================
    # ADMIN: REVOKE TOKENS
    # ==============================

    @abimethod()
    def revoke_student_id(self, student: Account) -> None:
        """
        Admin revokes Student ID Token from a student.
        Removes scholarship access immediately.
        """
        assert Txn.sender == self.admin, "Only admin"
        assert self.student_id_asa > 0, "Student ID ASA not configured"

        # Revoke by transferring from student to admin
        itxn.AssetTransfer(
            xfer_asset=self.student_id_asa,
            asset_sender=student,
            asset_receiver=self.admin,
            amount=UInt64(1),
            fee=0
        ).submit()

    @abimethod()
    def revoke_club_member(self, member: Account) -> None:
        """
        Admin revokes Club Member Token from a voter.
        Removes voting access immediately.
        """
        assert Txn.sender == self.admin, "Only admin"
        assert self.club_member_asa > 0, "Club Member ASA not configured"

        # Revoke by transferring from member to admin
        itxn.AssetTransfer(
            xfer_asset=self.club_member_asa,
            asset_sender=member,
            asset_receiver=self.admin,
            amount=UInt64(1),
            fee=0
        ).submit()

    # ==============================
    # VERIFICATION: CHECK HOLDINGS
    # ==============================

    @abimethod(readonly=True)
    def has_student_id(self, user: Account) -> bool:
        """Check if user holds Student ID Token"""
        if self.student_id_asa == UInt64(0):
            return False

        # Check if user's balance >= 1
        user_balance = user.asset_holding(self.student_id_asa).balance
        return user_balance >= UInt64(1)

    @abimethod(readonly=True)
    def has_club_member(self, user: Account) -> bool:
        """Check if user holds Club Member Token"""
        if self.club_member_asa == UInt64(0):
            return False

        # Check if user's balance >= 1
        user_balance = user.asset_holding(self.club_member_asa).balance
        return user_balance >= UInt64(1)

    @abimethod(readonly=True)
    def get_student_id_asa(self) -> UInt64:
        """Get Student ID Token ASA ID"""
        return self.student_id_asa

    @abimethod(readonly=True)
    def get_club_member_asa(self) -> UInt64:
        """Get Club Member Token ASA ID"""
        return self.club_member_asa
