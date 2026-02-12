from algopy import *
from algopy.arc4 import abimethod


class ScholarshipVoting(ARC4Contract):

    # Total applications received
    total_applications: UInt64

    # Total votes cast
    total_votes: UInt64

    # Identity token contract for access control
    identity_contract: UInt64

    # Club Member Token ASA ID (for voting access)
    club_member_asa: UInt64

    def __init__(self) -> None:
        # application ID → vote count
        self.application_votes = BoxMap(UInt64, UInt64, key_prefix="v")

        # voter address → has voted (boolean as UInt64)
        self.has_voted = BoxMap(Account, UInt64, key_prefix="h")

        self.total_applications = UInt64(0)
        self.total_votes = UInt64(0)
        self.identity_contract = UInt64(0)
        self.club_member_asa = UInt64(0)

    # ==============================
    # ADMIN: CONFIGURATION
    # ==============================

    @abimethod()
    def set_identity_contract(self, contract_id: UInt64) -> None:
        """Set the identity token contract address"""
        assert Txn.sender == Global.creator_address, "Only admin"
        self.identity_contract = contract_id

    @abimethod()
    def set_club_member_asa(self, asa_id: UInt64) -> None:
        """Set the club member token ASA ID"""
        assert Txn.sender == Global.creator_address, "Only admin"
        self.club_member_asa = asa_id

    # ==============================
    # STUDENT APPLICATIONS
    # ==============================

    @abimethod()
    def submit_application(self) -> UInt64:
        """
        Student submits scholarship application.
        No token requirement for submission (they apply to get Student ID).
        """
        self.total_applications += UInt64(1)
        return self.total_applications

    # ==============================
    # VOTING WITH ACCESS CONTROL
    # ==============================

    @abimethod()
    def vote_for_application(self, application_id: UInt64) -> UInt64:
        """
        Vote on scholarship application.
        REQUIRES: Club Member Token (one-wallet-one-vote)
        """
        # ACCESS CONTROL: Check Club Member Token
        if self.club_member_asa > UInt64(0):
            # Verify voter has Club Member token
            voter_balance = Txn.sender.asset_holding(self.club_member_asa).balance
            assert voter_balance >= UInt64(1), "Must hold Club Member Token to vote"

        # Prevent double voting
        voted, exists = self.has_voted.maybe(Txn.sender)
        assert not exists, "Already voted"

        # Mark voter
        self.has_voted[Txn.sender] = UInt64(1)

        # Increment vote count for application
        current_votes, app_exists = self.application_votes.maybe(application_id)
        if app_exists:
            self.application_votes[application_id] = current_votes + UInt64(1)
        else:
            self.application_votes[application_id] = UInt64(1)

        self.total_votes += UInt64(1)
        return self.application_votes[application_id]

    # ==============================
    # VIEW FUNCTIONS
    # ==============================

    @abimethod(readonly=True)
    def get_votes_for_application(self, application_id: UInt64) -> UInt64:
        votes, exists = self.application_votes.maybe(application_id)
        return votes if exists else UInt64(0)

    @abimethod(readonly=True)
    def get_total_applications(self) -> UInt64:
        return self.total_applications

    @abimethod(readonly=True)
    def get_total_votes(self) -> UInt64:
        return self.total_votes

    @abimethod(readonly=True)
    def has_voted(self, voter: Account) -> bool:
        """Check if voter has already voted"""
        _, exists = self.has_voted.maybe(voter)
        return exists

    @abimethod(readonly=True)
    def get_club_member_asa(self) -> UInt64:
        """Get Club Member Token ASA ID"""
        return self.club_member_asa
