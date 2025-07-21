# Voting Rules - Confidential Voting App

## Tổng quan
Confidential Voting App sử dụng FHE (Fully Homomorphic Encryption) để đảm bảo tính bảo mật của vote, nhưng vẫn có một số rules để đảm bảo tính công bằng.

## Voting Rules

### 1. **One Vote Per User Per Proposal**
- ✅ **Mỗi user chỉ được vote 1 lần cho mỗi proposal**
- ❌ **Không cho phép revote** - nếu đã vote rồi thì không thể vote lại
- 🔒 **Được enforce bởi smart contract** - `require(!hasVoted[proposalId][msg.sender], "Already voted")`

### 2. **Vote Values**
- **0 = Yes** (VoteOption.Yes)
- **1 = No** (VoteOption.No)
- **Boolean to Numeric conversion**:
  - `true` → `0` (Yes)
  - `false` → `1` (No)

### 3. **Vote Privacy**
- ✅ **Votes được encrypt** bằng FHE trước khi gửi lên blockchain
- ✅ **Individual votes không thể decrypt** bởi người khác
- ✅ **Vote counts được encrypt** cho đến khi được make public
- 🔒 **Chỉ user có thể decrypt vote của mình** (với proper authorization)

### 4. **Proposal Lifecycle**
1. **Created** - Proposal được tạo
2. **Voting** - Users có thể vote (encrypted)
3. **Public** - Vote counts được make public (optional)

## Frontend Implementation

### Error Handling
```typescript
// Specific error messages for better UX
if (error?.message?.includes('Already voted')) {
  throw new Error('You have already voted on this proposal. Each user can only vote once.')
}
```

### Vote Status Checking
```typescript
// Check if user has already voted
const hasUserVoted = async (proposalId: number): Promise<boolean> => {
  const voted = await contract.hasUserVoted(proposalId, account)
  return voted
}
```

### UI Behavior
- **Vote buttons disabled** nếu user đã vote
- **Clear error messages** khi user cố gắng vote lại
- **Real-time status updates** sau khi vote

## Smart Contract Rules

### Vote Function
```solidity
function vote(uint256 proposalId, externalEuint8 encryptedVote, bytes calldata proof) external {
    require(proposalId < proposals.length, "Invalid proposal");
    require(!hasVoted[proposalId][msg.sender], "Already voted");
    
    // Process encrypted vote...
    hasVoted[proposalId][msg.sender] = true;
}
```

### Vote Validation
- ✅ **Proposal exists** - `proposalId < proposals.length`
- ✅ **User hasn't voted** - `!hasVoted[proposalId][msg.sender]`
- ✅ **Valid FHE proof** - `FHE.fromExternal(encryptedVote, proof)`

## Security Features

### 1. **FHE Encryption**
- Votes được encrypt trước khi gửi lên blockchain
- Chỉ user có thể decrypt vote của mình
- Vote counts được aggregate trong encrypted form

### 2. **No Revote Protection**
- Smart contract enforce one vote per user
- Frontend checks vote status before allowing vote
- Clear error messages for better UX

### 3. **Proposal Validation**
- Check proposal exists before voting
- Validate proposal ID range
- Handle invalid proposal errors gracefully

## User Experience

### Before Voting
- User connects wallet
- User sees proposal list
- User can see if they've already voted

### During Voting
- User selects Yes/No
- FHE encryption happens automatically
- Vote is submitted to blockchain

### After Voting
- Vote button becomes disabled
- User sees confirmation
- Vote counts update (encrypted)

### Error Scenarios
- **Already voted**: Clear message, button disabled
- **Invalid proposal**: Refresh and try again
- **Network error**: Retry with better connection
- **FHE error**: Check network and SDK status

## Best Practices

### For Users
1. **Connect wallet** before voting
2. **Check vote status** before attempting to vote
3. **Wait for confirmation** after voting
4. **Don't try to vote twice** - it won't work

### For Developers
1. **Always check vote status** before showing vote buttons
2. **Handle "Already voted" errors** gracefully
3. **Show clear error messages** to users
4. **Cache vote status** to avoid excessive contract calls
5. **Validate proposal existence** before voting

## Testing Scenarios

### ✅ Valid Scenarios
- User votes for the first time
- User votes on different proposals
- User checks vote status

### ❌ Invalid Scenarios
- User tries to vote twice on same proposal
- User votes on non-existent proposal
- User votes without wallet connection

### 🔄 Edge Cases
- Network disconnection during vote
- FHE SDK loading issues
- Contract deployment issues 