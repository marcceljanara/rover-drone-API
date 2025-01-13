import pkg from 'pg';
import dotenv from 'dotenv';
import PaymentsService from '../PaymentsService.js';
import RentalsService from '../RentalsService.js';
import RentalsTableTestHelper from '../../../../tests/RentalsTableTestHelper.js';
import DevicesTableTestHelper from '../../../../tests/DevicesTableTestHelper';
import UsersTableTestHelper from '../../../../tests/UserTableHelper.js';
import PaymentsTableTestHelper from '../../../../tests/PaymentTableTestHelper';
import InvariantError from '../../../exceptions/InvariantError.js';
import NotFoundError from '../../../exceptions/NotFoundError.js';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool();

const addRentalPayload = ((userId) => {
  const today = new Date();
  const tommorow = new Date(today);
  const threeDaysLater = new Date(today);

  // Sent startDate menjadi besok
  tommorow.setDate(today.getDate() + 1);

  // Set endDate menjadi 3 hari setelah hari ini
  threeDaysLater.setDate(today.getDate() + 3);

  // Format tanggal menjadi YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    userId, // Ganti dengan ID user dinamis
    startDate: formatDate(tommorow),
    endDate: formatDate(threeDaysLater),
  };
});

describe('PaymentsService', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await RentalsTableTestHelper.cleanTable();
    await DevicesTableTestHelper.cleanTable();
    await PaymentsTableTestHelper.cleanTable();
  });

  describe('getAllPayments function', () => {
    it('should return all payments', async () => {
      // Arrange
      const rentalsService = new RentalsService();
      const paymentsService = new PaymentsService();
      const user1 = await UsersTableTestHelper.addUser({ id: 'user-123' });
      const user2 = await UsersTableTestHelper.addUser({ id: 'user-456', username: 'userkeren', email: 'userkeren@gmail.com' });
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });
      await DevicesTableTestHelper.addDevice({ id: 'device-456' });
      await rentalsService.addRental(addRentalPayload(user1), 'user');
      await rentalsService.addRental(addRentalPayload(user2), 'user');

      // Action
      const payment = await paymentsService.getAllPayments();

      // Assert
      expect(payment).toHaveLength(2);
    });
  });

  describe('getDetailPayment function', () => {
    it('should get detail payment', async () => {
      // Arrange
      const rentalsService = new RentalsService();
      const paymentsService = new PaymentsService();
      const user1 = await UsersTableTestHelper.addUser({ id: 'user-123' });
      const user2 = await UsersTableTestHelper.addUser({ id: 'user-456', username: 'userkeren', email: 'userkeren@gmail.com' });
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });
      await DevicesTableTestHelper.addDevice({ id: 'device-456' });
      const { payment_id } = await rentalsService.addRental(addRentalPayload(user1), 'user');
      await rentalsService.addRental(addRentalPayload(user2), 'user');

      // Action
      const payment = await paymentsService.getDetailPayment(payment_id);

      // Assert
      expect(payment.id).toBe(payment_id);
    });

    it('should throw error when payment not found', async () => {
      // Arrange
      const paymentsService = new PaymentsService();
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });
      await DevicesTableTestHelper.addDevice({ id: 'device-456' });
      const id = 'notfound';

      // Action and Assert
      await expect(paymentsService.getDetailPayment(id)).rejects.toThrow(NotFoundError);
    });
  });
  describe('verificationPayment function', () => {
    it('should verify payment and update payment details', async () => {
      // Arrange
      const paymentsService = new PaymentsService();
      const rentalsService = new RentalsService();
      const user = await UsersTableTestHelper.addUser({ id: 'user-123' });
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });
      const { payment_id } = await rentalsService.addRental(addRentalPayload(user), 'user');

      const payload = {
        id: payment_id,
        paymentDate: new Date().toISOString(),
        paymentStatus: 'completed',
        paymentMethod: 'BRI',
        transactionDescription: 'Payment successfully verified',
      };

      // Action
      const result = await paymentsService.verificationPayment(payload);

      // Assert
      expect(result.id).toBe(payment_id);
      expect(result.payment_status).toBe(payload.paymentStatus);
    });

    it('should throw error if payment not found', async () => {
      // Arrange
      const paymentsService = new PaymentsService();
      const payload = {
        id: 'notfound',
        paymentDate: new Date().toISOString(),
        paymentStatus: 'completed',
        paymentMethod: 'BRI',
        transactionDescription: 'Payment successfully verified',
      };

      // Action & Assert
      await expect(paymentsService.verificationPayment(payload)).rejects.toThrow(NotFoundError);
    });
    it('should throw InvariantError when updating payment fails', async () => {
      // Arrange
      const paymentsService = new PaymentsService();
      const rentalsService = new RentalsService();
      const user = await UsersTableTestHelper.addUser({ id: 'user-123' });
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });
      const { payment_id } = await rentalsService.addRental(addRentalPayload(user), 'user');

      const payload = {
        id: payment_id,
        paymentDate: new Date().toISOString(),
        paymentStatus: 'completed',
        paymentMethod: 'BRI',
        transactionDescription: 'Payment successfully verified',
      };

      // Mock query to simulate the payment being found
      const mockCheckQuery = jest.spyOn(paymentsService._pool, 'query')
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: payment_id }],
        }) // Simulate payment found
        // Mock the update query to fail by returning rowCount: 0
        .mockResolvedValueOnce({ rowCount: 0, rows: [] });

      // Action & Assert
      await expect(paymentsService
        .verificationPayment(payload)).rejects.toThrowError(InvariantError);
      expect(mockCheckQuery)
        .toHaveBeenCalledTimes(2); // Ensure both check and update queries were called
    });
  });

  describe('deletePayment function', () => {
    it('should delete payment by marking it as deleted', async () => {
      // Arrange
      const paymentsService = new PaymentsService();
      const rentalsService = new RentalsService();
      const user = await UsersTableTestHelper.addUser({ id: 'user-123' });
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });
      const { payment_id } = await rentalsService.addRental(addRentalPayload(user), 'user');

      // Action
      const result = await paymentsService.deletePayment(payment_id);

      // Assert
      expect(result.id).toBe(payment_id);

      // Verify the payment is marked as deleted
      const deletedPayment = await paymentsService.getDetailPayment(payment_id).catch((err) => err);
      expect(deletedPayment).toBeInstanceOf(NotFoundError);
    });

    it('should throw error if payment not found', async () => {
      // Arrange
      const paymentsService = new PaymentsService();
      const id = 'notfound';

      // Action & Assert
      await expect(paymentsService.deletePayment(id)).rejects.toThrow(NotFoundError);
    });
  });
  describe('transaction function', () => {
    it('should commit the transaction successfully', async () => {
      const paymentsService = new PaymentsService();
      const mockCallback = jest.fn().mockResolvedValue('Transaction Completed');

      const result = await paymentsService.transaction(mockCallback);

      expect(mockCallback).toHaveBeenCalled();
      expect(result).toBe('Transaction Completed');
    });

    it('should rollback the transaction when an error occurs', async () => {
      const paymentsService = new PaymentsService();
      const mockCallback = jest.fn().mockRejectedValue(new Error('Transaction Failed'));

      await expect(paymentsService.transaction(mockCallback)).rejects.toThrow('Transaction Failed');
      expect(mockCallback).toHaveBeenCalled();
    });
  });
});
