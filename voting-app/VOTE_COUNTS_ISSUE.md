# Vote Counts Issue - Confidential Voting

## Vấn đề hiện tại

User đã vote "YES" nhưng Results section vẫn hiển thị:
- "0 total votes"
- "Yes 0 votes (0%)"
- "No 0 votes (0%)"

## Nguyên nhân

### 1. **Vote Counts được Encrypt**
- Vote counts trong contract được lưu dưới dạng `euint8` (encrypted)
- Frontend không thể đọc trực tiếp được encrypted values
- Cần decrypt để hiển thị vote counts

### 2. **Contract Design**
```solidity
struct Proposal {
    string description;
    euint8 yesCount;    // Encrypted
    euint8 noCount;     // Encrypted
    bool isPublic;
    uint8 publicYesCount;  // Only used after makeVoteCountsPublic
    uint8 publicNoCount;   // Only used after makeVoteCountsPublic
}
```

### 3. **Vote Counts Lifecycle**
1. **Voting Phase**: Vote counts encrypted (`euint8`)
2. **Public Phase**: Vote counts decrypted và lưu vào `publicYesCount`/`publicNoCount`

## Giải pháp đã implement

### 1. **Enhanced Proposal Interface**
```typescript
interface Proposal {
  id: number
  description: string
  yesCount: number
  noCount: number
  isPublic: boolean
  createdAt: Date
  encryptedYesCount?: string    // Encrypted vote count
  encryptedNoCount?: string     // Encrypted vote count
  totalVotes?: number           // Calculated total
}
```

### 2. **Load Encrypted Vote Counts**
```typescript
// Try to get encrypted vote counts if not public
if (!isPublic) {
  try {
    const [encryptedYes, encryptedNo] = await contractToUse.getEncryptedVoteCount(i)
    encryptedYesCount = encryptedYes;
    encryptedNoCount = encryptedNo;
    totalVotes = 0; // Placeholder - needs decryption
  } catch (error) {
    console.log(`Could not get encrypted vote counts for proposal ${i}:`, error)
    totalVotes = 0;
  }
}
```

### 3. **Decrypt Function (Placeholder)**
```typescript
const decryptVoteCounts = async (proposalId: number): Promise<{yesCount: number, noCount: number}> => {
  // Get encrypted vote counts
  const [encryptedYes, encryptedNo] = await contract.getEncryptedVoteCount(proposalId)
  
  // TODO: Implement proper FHE decryption
  return {
    yesCount: 0, // Should be decrypted from encryptedYes
    noCount: 0   // Should be decrypted from encryptedNo
  }
}
```

## Các bước tiếp theo

### 1. **Implement FHE Decryption**
- Sử dụng Zama SDK để decrypt vote counts
- Handle proper authorization cho decryption
- Cache decrypted results

### 2. **UI Improvements**
- Hiển thị "Encrypted" thay vì "0 votes" khi chưa public
- Thêm button "Make Vote Counts Public"
- Show loading state khi decrypting

### 3. **Make Vote Counts Public**
- Implement function để mark proposal as public
- Decrypt vote counts và update `publicYesCount`/`publicNoCount`
- Refresh UI sau khi public

## Temporary Workaround

### Option 1: Make Vote Counts Public
```typescript
// Call this to make vote counts public
await makeVoteCountsPublic(proposalId)
```

### Option 2: Show Encrypted Status
```typescript
// Show "Encrypted" instead of "0 votes"
{proposal.isPublic ? (
  <span>{proposal.yesCount} votes</span>
) : (
  <span>Encrypted</span>
)}
```

### Option 3: Manual Decryption
```typescript
// Use FHE SDK to decrypt manually
const decryptedCounts = await decryptVoteCounts(proposalId)
```

## Expected Behavior

### Before Public
- Vote counts: "Encrypted"
- Total votes: "Encrypted"
- User can vote but can't see results

### After Public
- Vote counts: Actual numbers
- Total votes: Calculated sum
- User can see all results

## Testing

### Test Cases
1. **Vote on proposal** → Should show "Encrypted" counts
2. **Make vote counts public** → Should show actual counts
3. **Multiple votes** → Should aggregate correctly
4. **Decrypt manually** → Should work with FHE SDK

### Debug Steps
1. Check if proposal is public: `proposal.isPublic`
2. Check encrypted counts: `proposal.encryptedYesCount`
3. Try manual decryption: `decryptVoteCounts(proposalId)`
4. Check contract state: `getPublicVoteCounts(proposalId)`

## Next Implementation

### 1. **Proper FHE Decryption**
```typescript
const decryptVoteCounts = async (proposalId: number) => {
  const [encryptedYes, encryptedNo] = await contract.getEncryptedVoteCount(proposalId)
  
  // Use FHE SDK to decrypt
  const decryptedYes = await fhePublicDecrypt(encryptedYes)
  const decryptedNo = await fhePublicDecrypt(encryptedNo)
  
  return { yesCount: decryptedYes, noCount: decryptedNo }
}
```

### 2. **Real-time Updates**
```typescript
// Listen for VoteCountsMadePublic events
contract.on('VoteCountsMadePublic', (proposalId, yesCount, noCount) => {
  // Update UI with decrypted counts
  updateProposalCounts(proposalId, yesCount, noCount)
})
```

### 3. **Better UX**
- Show "Vote submitted" confirmation
- Display "Results will be available after public release"
- Add "Make Public" button for proposal creators 